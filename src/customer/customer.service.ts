import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';

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

  async findAll(): Promise<Customer[]> {
    return this.prisma.customer.findMany();
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