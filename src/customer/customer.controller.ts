import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Customer } from './entities/customer.entity';
import { CustomerRoleCountDto } from './dto/role-count-customer.dto';
import { JwtAuthGuard } from 'src/auth/strategies/jwt.authguard';
import { UserRoleGuard } from 'src/auth/guards/user-role/user-role.guard';

@ApiBearerAuth()
@ApiTags('Customers')
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @ApiOperation({ summary: 'CREATE CUSTOMER', description: 'Register a new customer' })
  @ApiResponse({ status: 201, description: 'Created', type: Customer })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
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
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  findAll(
    @Query('filter') filter?: string,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('current_page') current_page = 1,
    @Query('page_size') page_size = 10,
  ) {
    return this.customerService.findAll(filter, start_date, end_date, current_page, page_size);
  }

  @Get('today-count-by-role')
  @ApiOperation({ summary: 'GET TODAY\'S CUSTOMER COUNT BY ROLE', description: 'Get count of customers last seen today grouped by role' })
  @ApiResponse({ status: 200, description: 'OK',  type: [CustomerRoleCountDto] })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  async getTodayCountByRole() {
    return this.customerService.getTodayCountByRole();
  }

  @Get('month-count-by-role')
  @ApiOperation({ summary: 'GET Month\'S CUSTOMER COUNT BY ROLE', description: 'Get count of customers last seen today grouped by role' })
  @ApiResponse({ status: 200, description: 'OK',  type: [CustomerRoleCountDto] })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  async getMonthCountByRole() {
    return this.customerService.getCurrentMonthCountByRole();
  }

  @Get('daily-count-by-role')
  @ApiOperation({ summary: 'GET DAILY CUSTOMER COUNT BY ROLE', description: 'Get count of customers last seen today grouped by role' })
  @ApiQuery({ name: 'start_date', required: false, description: 'Filter customers by last_seen_at range' })
  @ApiQuery({ name: 'end_date', required: false, description: 'Filter customers by last_seen_at range' })
  @ApiResponse({ status: 200, description: 'OK',  type: [CustomerRoleCountDto] })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  async getDailyRoleCounts(
    @Query('start_date') start_date: Date,
    @Query('end_date') end_date: Date,
  ) {
    return this.customerService.getDailyRoleCounts(start_date, end_date);
  }

  @Get(':id')
  @ApiOperation({ summary: 'GET CUSTOMER BY ID', description: 'Get customer details' })
  @ApiResponse({ status: 200, description: 'OK', type: Customer })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'UPDATE CUSTOMER', description: 'Update customer details' })
  @ApiResponse({ status: 200, description: 'Updated', type: Customer })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customerService.update(+id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'DELETE CUSTOMER', description: 'Remove a customer' })
  @ApiResponse({ status: 200, description: 'Deleted', schema: { example: { message: 'Customer deleted' } } })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  remove(@Param('id') id: string) {
    return this.customerService.remove(+id);
  }
}