import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Session } from './entities/session.entity';

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

  async findAll(): Promise<Session[]> {
    return this.prisma.session.findMany();
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