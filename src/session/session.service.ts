import { Injectable, NotFoundException, BadRequestException, Logger, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Session } from './entities/session.entity';
import { CustomerRole, ImageType, Prisma } from '@prisma/client';
import { BatchFaceDto, CustomerEmbedding } from './dto/create-embedding.dto';
import { CreateCustomerDto } from 'src/customer/dto/create-customer.dto';
import { CreateHistoryDto } from 'src/history/dto/create-history.dto';
import { CreateImageDto } from 'src/image/dto/create-image.dto';
import { CustomerService } from 'src/customer/customer.service';
import { CameraService } from 'src/camera/camera.service';
import { HistoryService } from 'src/history/history.service';
import { ImageService } from 'src/image/image.service';

@Injectable()
export class SessionService implements OnModuleInit  {
  private embeddingsCache: Map<number, CustomerEmbedding> = new Map();
  private initialized = false;
  private readonly logger = new Logger('SessionService');

  constructor(
    private prisma: PrismaService,
    private readonly customerService: CustomerService,
    private readonly cameraService: CameraService,
    private readonly historyService: HistoryService,
    private readonly imageService: ImageService,


  ) {}
  async onModuleInit() {
    await this.loadAllEmbeddings();
  }

  private async loadAllEmbeddings(): Promise<void> {
    if (this.initialized) return;
    
    const sessions = await this.prisma.session.findMany({
      select: {
        id: true,
        customer_id: true,
        day_session: true,
        session_date: true
      }
    });

    sessions.forEach(session => {
      this.embeddingsCache.set(
        session.customer_id, 
        {
          id: session.id,
          embedding: JSON.parse(session.day_session.toString()),
          lastUpdated: session.session_date
        }
      );
    });

    this.initialized = true;
    console.log(`Loaded ${this.embeddingsCache.size} embeddings to cache`);
  }

  public async processBatch(batchFaceDto: BatchFaceDto) {
    const faces = batchFaceDto.data;

    console.log(`Received ${faces.length} face records.`);

    await Promise.all(
      faces.map((face, index) => {
        console.log(`Face #${index + 1}: ${face.image_url}`);
        console.log(`Embedding: ${face.embedding.slice(0, 5)}...`);
        return this.detectFace(face.embedding, face.image_url, face.camera_id, face.camera_sub_id);
      })
    );

    return {
      message: `Processed ${faces.length} face records successfully.`,
    };
  }

  public async detectFace(embedding: number[], image_url: string, floor_num: number, floor_sub_num: number) {
    const match = await this.findSimilarEmbedding(embedding);
    let customer_id = null;
    let distance = -1;
    if (match) {
      customer_id = match.customerId;
      distance = match.distance;
      console.log("--------------Matched User------------------", distance)
    }
    else {
      const curDate = new Date();
      let customer_data: CreateCustomerDto = {
        name: "User_" + curDate.getTime().toString(),
        role: CustomerRole.user,
        detail_info: "Newly added User"
      }
      const newCustomer = await this.customerService.create(customer_data);
      customer_id = newCustomer.id;
      distance = 0;
    }
    // 1. Add History
    const camera = await this.cameraService.findByFloors(floor_num, floor_sub_num);
    const history_data: CreateHistoryDto = {
      customer_id: customer_id,
      camera_id: camera.id,
      seen_at: new Date()
    }
    const history = await this.historyService.create(history_data)

    // 2. Add Image
    const image_data: CreateImageDto = {
      customer_id: customer_id,
      camera_id: camera.id,
      history_id: history.id,
      image_type: ImageType.face,
      url: image_url
    }
    await this.imageService.create(image_data)

    // 3. Update User
    await this.customerService.update(customer_id, {
      last_seen_at: new Date()
    })

    // 4. Update existing session
    await this.updateOrCreateSession(
      customer_id,
      embedding
    );
  }

  public async findSimilarEmbedding(
    targetEmbedding: number[],
    threshold: number = 0.6
  ): Promise<{ customerId: number; distance: number } | null> {
    let minDistance = Infinity;
    let bestMatch: { customerId: number; distance: number } | null = null;

    for (const [customerId, data] of this.embeddingsCache) {
      const distance = this.cosineDistance(targetEmbedding, data.embedding);

      // If the distance is below the threshold and is a better match, store it
      if (distance < threshold && distance < minDistance) {
        minDistance = distance;
        bestMatch = { customerId, distance };
      }
    }

    return bestMatch;
  }
  

  public async updateOrCreateSession(
    customerId: number,
    embedding: number[]
  ): Promise<void> {
    const existing = this.embeddingsCache.get(customerId);
    const now = new Date();

    const embeddingBuffer = Buffer.from(JSON.stringify(embedding));

    if (existing) {
      // Update existing session
      await this.prisma.session.update({
        where: { id: existing.id },
        data: {
          day_session: embeddingBuffer,
          session_date: now
        }
      });
      existing.embedding = embedding;
      existing.lastUpdated = now;
    } else {
      // Create new session
      const newSession = await this.prisma.session.create({
        data: {
          customer_id:  customerId,
          day_session: embeddingBuffer,
          session_date: now
        }
      });
      
      this.embeddingsCache.set(customerId, {
        id: newSession.id,
        embedding,
        lastUpdated: now
      });
    }
  }

  private cosineDistance(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return 1 - (dotProduct / (normA * normB));
  }

  async create(createSessionDto: CreateSessionDto) {
    try {
      // Verify customer exists first
      await this.prisma.customer.findUniqueOrThrow({
        where: { id: createSessionDto.customer_id },
      });

      return await this.prisma.session.create({
        data: {
          ...createSessionDto,
          day_session: Buffer.from(JSON.stringify(createSessionDto.day_session))
        },
      });
    } catch (error) {
      this.logger.error(`CREATE: ${error.message}`);
      if (error.code === 'P2003') {
        throw new NotFoundException('Customer not found');
      }
      throw new BadRequestException('Failed to create session');
    }
  }

  async findAll(
    filter?: string,
    start_date?: string,
    end_date?: string,
    current_page = 1,
    page_size = 10,
  ) {
    try {
      current_page = Number(current_page)
      page_size = Number(page_size)
      const skip = (current_page - 1) * page_size;
  
      const orConditions: Prisma.SessionWhereInput[] = [];
  
      if (filter) {
        orConditions.push(
          {
            customer: {
              name: {
                contains: filter,
                mode: 'insensitive' as const,
              },
            },
          },
        );
      }
  
      const whereCondition: Prisma.SessionWhereInput = {
        AND: [
          orConditions.length > 0 ? { OR: orConditions } : {},
          start_date || end_date
            ? {
                session_date: {
                  ...(start_date ? { gte: new Date(start_date) } : {}),
                  ...(end_date ? { lte: new Date(end_date) } : {}),
                },
              }
            : {},
        ],
      };
  
      const [sessions, total] = await this.prisma.$transaction([
        this.prisma.session.findMany({
          where: whereCondition,
          skip,
          take: page_size,
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            customer: true,
            day_session: true,
            session_date: true,
            created_at: true,
          },
        }),
        this.prisma.session.count({ where: whereCondition }),
      ]);
  
      return {
        data: sessions,
        meta: {
          total,
          current_page,
          page_size,
          total_pages: Math.ceil(total / page_size),
        },
      };
    } catch (error) {
      this.logger.error(`GET: error: ${error}`);
      throw new InternalServerErrorException('Server error');
    }
  }

  async findOne(id: number): Promise<Session> {
    const session = await this.prisma.session.findUnique({
      where: { id },
    });
    if (!session) {
      throw new NotFoundException(`Session #${id} not found`);
    }
    return {
      ...session,
      day_session: JSON.parse(session.day_session.toString())
    };
  }

  async update(id: number, updateSessionDto: UpdateSessionDto) {
    try {
      if (updateSessionDto.customer_id) {
        // Verify new customer exists if updating customer_id
        await this.prisma.customer.findUniqueOrThrow({
          where: { id: updateSessionDto.customer_id },
        });
      }

      return await this.prisma.session.update({
        where: { id },
        data: {
          ...updateSessionDto,
          day_session: Buffer.from(JSON.stringify(updateSessionDto.day_session))
        },
      });
    } catch (error) {
      this.logger.error(`UPDATE: ${error.message}`);
      if (error.code === 'P2025') {
        throw new NotFoundException(`Session #${id} not found`);
      }
      if (error.code === 'P2003') {
        throw new NotFoundException('Customer not found');
      }
      throw new BadRequestException('Failed to update session');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      await this.prisma.session.delete({ where: { id } });
      return { message: 'Session deleted' };
    } catch (error) {
      this.logger.error(`DELETE: ${error.message}`);
      if (error.code === 'P2025') {
        throw new NotFoundException(`Session #${id} not found`);
      }
      throw new BadRequestException('Failed to delete session');
    }
  }

  async findByCustomer(customerId: number) {
    try {
      await this.prisma.customer.findUniqueOrThrow({
        where: { id: customerId },
      });

      return this.prisma.session.findMany({
        where: { customer_id: customerId },
      });
    } catch (error) {
      this.logger.error(`FIND_BY_CUSTOMER: ${error.message}`);
      if (error.code === 'P2025') {
        throw new NotFoundException('Customer not found');
      }
      throw new BadRequestException('Failed to fetch sessions');
    }
  }
}