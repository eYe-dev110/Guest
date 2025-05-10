import { Injectable, BadRequestException, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';
import { CustomerRole, Prisma } from '@prisma/client';
import { CustomerRoleCountDto, DailyRoleCountDto } from './dto/role-count-customer.dto';

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

  async getTodayCountByRole(): Promise<CustomerRoleCountDto[]> {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
  
      const result = await this.prisma.customer.groupBy({
        by: ['role'],
        where: {
          last_seen_at: {
            gte: todayStart,
            lte: todayEnd
          }
        },
        _count: {
          id: true
        },
        orderBy: {
          role: 'asc'
        }
      });
  
      return result.map(item => ({
        role: item.role,
        count: item._count.id
      }));
    } catch (error) {
      this.logger.error(`GET_TODAY_COUNT_BY_ROLE: error: ${error}`);
      throw new InternalServerErrorException('Server error');
    }
  }
  
  async getCurrentMonthCountByRole(): Promise<CustomerRoleCountDto[]> {
    try {
      // Get first and last day of current month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      lastDayOfMonth.setHours(23, 59, 59, 999);
  
      const result = await this.prisma.customer.groupBy({
        by: ['role'],
        where: {
          last_seen_at: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth
          }
        },
        _count: {
          id: true
        },
        orderBy: {
          role: 'asc'
        }
      });
  
      return result.map(item => ({
        role: item.role,
        count: item._count.id
      }));
    } catch (error) {
      this.logger.error(`GET_CURRENT_MONTH_COUNT_BY_ROLE: error: ${error}`);
      throw new InternalServerErrorException('Server error');
    }
  }

  async getDailyRoleCounts(start_date: Date, end_date: Date): Promise<DailyRoleCountDto[]> {
    try {
      // ... (same validation and date setup)
  
      const results: DailyRoleCountDto[] = [];
      let currentDate = new Date(start_date);
      let endDate = new Date(end_date)
  
      while (currentDate <= endDate) {
        const nextDay = new Date(currentDate);
        nextDay.setDate(nextDay.getDate() + 1);

  
        const dayCounts = await this.prisma.customer.groupBy({
          by: ['role'],
          where: {
            last_seen_at: {
              gte: currentDate,
              lt: nextDay
            }
          },
          _count: {
            id: true
          },
          orderBy: {
            role: 'asc'
          }
        });
  
        results.push({
          date: currentDate.toISOString().split('T')[0],
          counts: dayCounts.map(item => ({
            role: item.role,
            count: item._count.id
          }))
        });
  
        currentDate.setDate(currentDate.getDate() + 1);
      }
  
      return results;
    } catch (error) {
      // ... (same error handling)
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
        if ([CustomerRole.client.toString(), CustomerRole.employeer.toString(), CustomerRole.user.toString()].includes(filter.toLowerCase())) {
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