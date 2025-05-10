import { Injectable, BadRequestException, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class CustomerService {
  private readonly logger = new Logger('CustomerService');

  constructor(private prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    try {
      return await this.prisma.customer.create({
        data: {
          ...createCustomerDto,
          role: createCustomerDto.role || 'user', // Default role
        },
      });
    } catch (error) {
      this.logger.error(`CREATE: ${error.message}`);
      throw new BadRequestException('Failed to create customer');
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
  
      const orConditions: Prisma.CustomerWhereInput[] = [];
  
      if (filter) {
        orConditions.push(
          {
            name: {
              contains: filter,
              mode: 'insensitive',
            },
          },
          {
            detail_info: {
              contains: filter,
              mode: 'insensitive',
            },
          }
        );
  
        // Optional: add role filtering only if filter is an exact match
        if (['user', 'admin', 'guest'].includes(filter.toLowerCase())) {
          orConditions.push({
            role: {
              equals: filter.toLowerCase() as any, // Cast to enum if needed
            },
          });
        }
      }
  
      const whereCondition: Prisma.CustomerWhereInput = {
        AND: [
          orConditions.length > 0 ? { OR: orConditions } : {},
          start_date || end_date
            ? {
                last_seen_at: {
                  ...(start_date ? { gte: new Date(start_date) } : {}),
                  ...(end_date ? { lte: new Date(end_date) } : {}),
                },
              }
            : {},
        ],
      };
  
      const [customers, total] = await this.prisma.$transaction([
        this.prisma.customer.findMany({
          where: whereCondition,
          skip,
          take: page_size,
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            name: true,
            role: true,
            detail_info: true,
            last_seen_at: true,
            created_at: true,
            updated_at: true,
          },
        }),
        this.prisma.customer.count({ where: whereCondition }),
      ]);
  
      return {
        data: customers,
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
  
  async findOne(id: number): Promise<Customer> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });
    if (!customer) {
      throw new NotFoundException(`Customer #${id} not found`);
    }
    return customer;
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    try {
      return await this.prisma.customer.update({
        where: { id },
        data: updateCustomerDto,
      });
    } catch (error) {
      this.logger.error(`UPDATE: ${error.message}`);
      if (error.code === 'P2025') {
        throw new NotFoundException(`Customer #${id} not found`);
      }
      throw new BadRequestException('Failed to update customer');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      await this.prisma.customer.delete({ where: { id } });
      return { message: 'Customer deleted' };
    } catch (error) {
      this.logger.error(`DELETE: ${error.message}`);
      if (error.code === 'P2025') {
        throw new NotFoundException(`Customer #${id} not found`);
      }
      throw new BadRequestException('Failed to delete customer');
    }
  }
}