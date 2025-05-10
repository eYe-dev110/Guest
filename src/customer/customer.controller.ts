import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Customer } from './entities/customer.entity';

@ApiBearerAuth()
@ApiTags('Customers')
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @ApiOperation({ summary: 'CREATE CUSTOMER', description: 'Register a new customer' })
  @ApiResponse({ status: 201, description: 'Created', type: Customer })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'GET ALL CUSTOMERS', description: 'List all customers' })
  @ApiResponse({ status: 200, description: 'OK', type: [Customer] })
  findAll() {
    return this.customerService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'GET CUSTOMER BY ID', description: 'Get customer details' })
  @ApiResponse({ status: 200, description: 'OK', type: Customer })
  @ApiResponse({ status: 404, description: 'Not Found' })
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'UPDATE CUSTOMER', description: 'Update customer details' })
  @ApiResponse({ status: 200, description: 'Updated', type: Customer })
  @ApiResponse({ status: 404, description: 'Not Found' })
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customerService.update(+id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'DELETE CUSTOMER', description: 'Remove a customer' })
  @ApiResponse({ status: 200, description: 'Deleted', schema: { example: { message: 'Customer deleted' } } })
  @ApiResponse({ status: 404, description: 'Not Found' })
  remove(@Param('id') id: string) {
    return this.customerService.remove(+id);
  }
}