import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { History } from './entities/history.entity';
import { UserRoleGuard } from 'src/auth/guards/user-role/user-role.guard';
import { JwtAuthGuard } from 'src/auth/strategies/jwt.authguard';

@ApiBearerAuth()
@ApiTags('History')
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  @ApiOperation({ summary: 'CREATE HISTORY RECORD', description: 'Create new history entry' })
  @ApiResponse({ status: 201, description: 'Created', type: History })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Customer/Camera not found' })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  create(@Body() createHistoryDto: CreateHistoryDto) {
    return this.historyService.create(createHistoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'GET ALL HISTORY', description: 'List all history records' })
  @ApiQuery({ name: 'filter', required: false, description: 'Filter histories by search fields' })
  @ApiQuery({ name: 'start_date', required: false, description: 'Filter histories by last_seen_at range' })
  @ApiQuery({ name: 'end_date', required: false, description: 'Filter histories by last_seen_at range' })
  @ApiQuery({ name: 'current_page', required: false, type: Number, description: 'Page number (1-based)' })
  @ApiQuery({ name: 'page_size', required: false, type: Number, description: 'Number of items per page' })
  @ApiResponse({ status: 200, description: 'OK', type: [History] })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  findAll(
    @Query('filter') filter?: string,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('current_page') current_page = 1,
    @Query('page_size') page_size = 10,
  ) {
    return this.historyService.findAll(filter, start_date, end_date, current_page, page_size);
  }

  @Get(':id')
  @ApiOperation({ summary: 'GET HISTORY BY ID', description: 'Get specific history record' })
  @ApiResponse({ status: 200, description: 'OK', type: History })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  findOne(@Param('id') id: string) {
    return this.historyService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'UPDATE HISTORY', description: 'Update history record' })
  @ApiResponse({ status: 200, description: 'Updated', type: History })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  update(@Param('id') id: string, @Body() updateHistoryDto: UpdateHistoryDto) {
    return this.historyService.update(+id, updateHistoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'DELETE HISTORY', description: 'Remove history record' })
  @ApiResponse({ status: 200, description: 'Deleted', schema: { example: { message: 'History record deleted' } } })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  remove(@Param('id') id: string) {
    return this.historyService.remove(+id);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'GET CUSTOMER HISTORY', description: 'Get all history for a customer' })
  @ApiResponse({ status: 200, description: 'OK', type: [History] })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  findByCustomer(@Param('customerId') customerId: string) {
    return this.historyService.findByCustomer(+customerId);
  }

  @Get('camera/:cameraId')
  @ApiOperation({ summary: 'GET CAMERA HISTORY', description: 'Get all history for a camera' })
  @ApiResponse({ status: 200, description: 'OK', type: [History] })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  findByCamera(@Param('cameraId') cameraId: string) {
    return this.historyService.findByCamera(+cameraId);
  }

  @Get('time-range')
  @ApiOperation({ summary: 'GET HISTORY BY TIME RANGE', description: 'Get history within date range' })
  @ApiResponse({ status: 200, description: 'OK', type: [History] })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  findByTimeRange(
    @Query('start') start: string,
    @Query('end') end: string
  ) {
    return this.historyService.findByTimeRange(new Date(start), new Date(end));
  }
}