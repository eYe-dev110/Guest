import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Session } from './entities/session.entity';
import { JwtAuthGuard } from 'src/auth/strategies/jwt.authguard';
import { UserRoleGuard } from 'src/auth/guards/user-role/user-role.guard';

@ApiBearerAuth()
@ApiTags('Sessions')
@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  @ApiOperation({ summary: 'CREATE SESSION', description: 'Create a new session record' })
  @ApiResponse({ status: 201, description: 'Created', type: Session })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  create(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionService.create(createSessionDto);
  }

  @Get()
  @ApiOperation({ summary: 'GET ALL SESSIONS', description: 'List all sessions' })
  @ApiQuery({ name: 'filter', required: false, description: 'Filter sessions by search fields' })
  @ApiQuery({ name: 'start_date', required: false, description: 'Filter sessions by created_at range' })
  @ApiQuery({ name: 'end_date', required: false, description: 'Filter sessions by created_at range' })
  @ApiQuery({ name: 'current_page', required: false, type: Number, description: 'Page number (1-based)' })
  @ApiQuery({ name: 'page_size', required: false, type: Number, description: 'Number of items per page' })
  @ApiResponse({ status: 200, description: 'OK', type: [Session] })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  findAll(
    @Query('filter') filter?: string,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('current_page') current_page = 1,
    @Query('page_size') page_size = 10,
  ) {
    return this.sessionService.findAll(filter, start_date, end_date, current_page, page_size);
  }

  @Get(':id')
  @ApiOperation({ summary: 'GET SESSION BY ID', description: 'Get session details' })
  @ApiResponse({ status: 200, description: 'OK', type: Session })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  findOne(@Param('id') id: string) {
    return this.sessionService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'UPDATE SESSION', description: 'Update session details' })
  @ApiResponse({ status: 200, description: 'Updated', type: Session })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  update(@Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto) {
    return this.sessionService.update(+id, updateSessionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'DELETE SESSION', description: 'Remove a session record' })
  @ApiResponse({ status: 200, description: 'Deleted', schema: { example: { message: 'Session deleted' } } })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  remove(@Param('id') id: string) {
    return this.sessionService.remove(+id);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'GET SESSIONS BY CUSTOMER', description: 'List all sessions for a customer' })
  @ApiResponse({ status: 200, description: 'OK', type: [Session] })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  findByCustomer(@Param('customerId') customerId: string) {
    return this.sessionService.findByCustomer(+customerId);
  }
}