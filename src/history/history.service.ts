import { Injectable, NotFoundException, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { History } from './entities/history.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class HistoryService {
  private readonly logger = new Logger('HistoryService');

  constructor(private prisma: PrismaService) {}

  async create(createHistoryDto: CreateHistoryDto): Promise<History> {
    try {
      // Verify customer and camera exist
      await Promise.all([
        this.prisma.customer.findUniqueOrThrow({
          where: { id: createHistoryDto.customer_id },
        }),
        this.prisma.camera.findUniqueOrThrow({
          where: { id: createHistoryDto.camera_id },
        }),
      ]);

      return await this.prisma.history.create({
        data: createHistoryDto,
      });
    } catch (error) {
      this.logger.error(`CREATE: ${error.message}`);
      if (error.code === 'P2003') {
        throw new NotFoundException(
          error.meta?.field_name?.includes('customer_id') 
            ? 'Customer not found' 
            : 'Camera not found'
        );
      }
      throw new BadRequestException('Failed to create history record');
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
      const skip = (current_page - 1) * page_size;
  
      const orConditions: Prisma.HistoryWhereInput[] = [];
  
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
          {
            camera: {
              title: {
                contains: filter,
                mode: 'insensitive' as const,
              },
            },
          },
          {
            camera: {
              sub_title: {
                contains: filter,
                mode: 'insensitive' as const,
              },
            },
          },
        );
      }
  
      const whereCondition: Prisma.HistoryWhereInput = {
        AND: [
          orConditions.length > 0 ? { OR: orConditions } : {},
          start_date || end_date
            ? {
                seen_at: {
                  ...(start_date ? { gte: new Date(start_date) } : {}),
                  ...(end_date ? { lte: new Date(end_date) } : {}),
                },
              }
            : {},
        ],
      };
  
      const [histories, total] = await this.prisma.$transaction([
        this.prisma.history.findMany({
          where: whereCondition,
          skip,
          take: page_size,
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            customer: true,
            camera: true,
            seen_at: true,
            created_at: true,
          },
        }),
        this.prisma.history.count({ where: whereCondition }),
      ]);
  
      return {
        data: histories,
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

  async findOne(id: number): Promise<History> {
    const history = await this.prisma.history.findUnique({
      where: { id },
    });
    if (!history) {
      throw new NotFoundException(`History record #${id} not found`);
    }
    return history;
  }

  async update(id: number, updateHistoryDto: UpdateHistoryDto): Promise<History> {
    try {
      if (updateHistoryDto.customer_id) {
        await this.prisma.customer.findUniqueOrThrow({
          where: { id: updateHistoryDto.customer_id },
        });
      }
      if (updateHistoryDto.camera_id) {
        await this.prisma.camera.findUniqueOrThrow({
          where: { id: updateHistoryDto.camera_id },
        });
      }

      return await this.prisma.history.update({
        where: { id },
        data: updateHistoryDto,
      });
    } catch (error) {
      this.logger.error(`UPDATE: ${error.message}`);
      if (error.code === 'P2025') {
        throw new NotFoundException(`History record #${id} not found`);
      }
      if (error.code === 'P2003') {
        throw new NotFoundException(
          error.meta?.field_name?.includes('customer_id') 
            ? 'Customer not found' 
            : 'Camera not found'
        );
      }
      throw new BadRequestException('Failed to update history record');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      await this.prisma.history.delete({ where: { id } });
      return { message: 'History record deleted' };
    } catch (error) {
      this.logger.error(`DELETE: ${error.message}`);
      if (error.code === 'P2025') {
        throw new NotFoundException(`History record #${id} not found`);
      }
      throw new BadRequestException('Failed to delete history record');
    }
  }

  async findByCustomer(customerId: number): Promise<History[]> {
    try {
      await this.prisma.customer.findUniqueOrThrow({
        where: { id: customerId },
      });
      return this.prisma.history.findMany({
        where: { customer_id: customerId },
        orderBy: { seen_at: 'desc' },
      });
    } catch (error) {
      this.logger.error(`FIND_BY_CUSTOMER: ${error.message}`);
      if (error.code === 'P2025') {
        throw new NotFoundException('Customer not found');
      }
      throw new BadRequestException('Failed to fetch history');
    }
  }

  async findByCamera(cameraId: number): Promise<History[]> {
    try {
      await this.prisma.camera.findUniqueOrThrow({
        where: { id: cameraId },
      });
      return this.prisma.history.findMany({
        where: { camera_id: cameraId },
        orderBy: { seen_at: 'desc' },
      });
    } catch (error) {
      this.logger.error(`FIND_BY_CAMERA: ${error.message}`);
      if (error.code === 'P2025') {
        throw new NotFoundException('Camera not found');
      }
      throw new BadRequestException('Failed to fetch history');
    }
  }

  async findByTimeRange(start: Date, end: Date): Promise<History[]> {
    return this.prisma.history.findMany({
      where: {
        seen_at: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { seen_at: 'desc' },
    });
  }
}