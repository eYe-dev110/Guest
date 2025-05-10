import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
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
  @ApiQuery({ name: 'filter', required: false, description: 'Filter customers by search fields' })
  @ApiQuery({ name: 'start_date', required: false, description: 'Filter customers by last_seen_at range' })
  @ApiQuery({ name: 'end_date', required: false, description: 'Filter customers by last_seen_at range' })
  @ApiQuery({ name: 'current_page', required: false, type: Number, description: 'Page number (1-based)' })
  @ApiQuery({ name: 'page_size', required: false, type: Number, description: 'Number of items per page' })
  @ApiResponse({ status: 200, description: 'OK', type: [Customer] })
  findAll(
    @Query('filter') filter?: string,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('current_page') current_page = 1,
    @Query('page_size') page_size = 10,
  ) {
    return this.customerService.findAll(filter, start_date, end_date, current_page, page_size);
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