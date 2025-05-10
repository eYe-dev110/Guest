import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { History } from './entities/history.entity';

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
  create(@Body() createHistoryDto: CreateHistoryDto) {
    return this.historyService.create(createHistoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'GET ALL HISTORY', description: 'List all history records' })
  @ApiResponse({ status: 200, description: 'OK', type: [History] })
  findAll() {
    return this.historyService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'GET HISTORY BY ID', description: 'Get specific history record' })
  @ApiResponse({ status: 200, description: 'OK', type: History })
  @ApiResponse({ status: 404, description: 'Not Found' })
  findOne(@Param('id') id: string) {
    return this.historyService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'UPDATE HISTORY', description: 'Update history record' })
  @ApiResponse({ status: 200, description: 'Updated', type: History })
  @ApiResponse({ status: 404, description: 'Not Found' })
  update(@Param('id') id: string, @Body() updateHistoryDto: UpdateHistoryDto) {
    return this.historyService.update(+id, updateHistoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'DELETE HISTORY', description: 'Remove history record' })
  @ApiResponse({ status: 200, description: 'Deleted', schema: { example: { message: 'History record deleted' } } })
  @ApiResponse({ status: 404, description: 'Not Found' })
  remove(@Param('id') id: string) {
    return this.historyService.remove(+id);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'GET CUSTOMER HISTORY', description: 'Get all history for a customer' })
  @ApiResponse({ status: 200, description: 'OK', type: [History] })
  findByCustomer(@Param('customerId') customerId: string) {
    return this.historyService.findByCustomer(+customerId);
  }

  @Get('camera/:cameraId')
  @ApiOperation({ summary: 'GET CAMERA HISTORY', description: 'Get all history for a camera' })
  @ApiResponse({ status: 200, description: 'OK', type: [History] })
  findByCamera(@Param('cameraId') cameraId: string) {
    return this.historyService.findByCamera(+cameraId);
  }

  @Get('time-range')
  @ApiOperation({ summary: 'GET HISTORY BY TIME RANGE', description: 'Get history within date range' })
  @ApiResponse({ status: 200, description: 'OK', type: [History] })
  findByTimeRange(
    @Query('start') start: string,
    @Query('end') end: string
  ) {
    return this.historyService.findByTimeRange(new Date(start), new Date(end));
  }
}