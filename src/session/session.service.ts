import { Injectable, NotFoundException, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Session } from './entities/session.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class SessionService {
  private readonly logger = new Logger('SessionService');

  constructor(private prisma: PrismaService) {}

  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    try {
      // Verify customer exists first
      await this.prisma.customer.findUniqueOrThrow({
        where: { id: createSessionDto.customer_id },
      });

      return await this.prisma.session.create({
        data: createSessionDto,
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
    return session;
  }

  async update(id: number, updateSessionDto: UpdateSessionDto): Promise<Session> {
    try {
      if (updateSessionDto.customer_id) {
        // Verify new customer exists if updating customer_id
        await this.prisma.customer.findUniqueOrThrow({
          where: { id: updateSessionDto.customer_id },
        });
      }

      return await this.prisma.session.update({
        where: { id },
        data: updateSessionDto,
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

  async findByCustomer(customerId: number): Promise<Session[]> {
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