import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CameraService } from './camera.service';
import { CreateCameraDto } from './dto/create-camera.dto';
import { UpdateCameraDto } from './dto/update-camera.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Camera } from './entities/camera.entity';

@ApiBearerAuth()
@ApiTags('Cameras')
@Controller('cameras')
export class CameraController {
  constructor(private readonly cameraService: CameraService) {}

  @Post()
  @ApiOperation({ summary: 'CREATE CAMERA', description: 'Register a new camera' })
  @ApiResponse({ status: 201, description: 'Created', type: Camera })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() createCameraDto: CreateCameraDto) {
    return this.cameraService.create(createCameraDto);
  }

  @Get()
  @ApiOperation({ summary: 'GET ALL CAMERAS', description: 'List all cameras' })
  @ApiQuery({ name: 'filter', required: false, description: 'Filter cameras  by search fields' })
  @ApiQuery({ name: 'current_page', required: false, type: Number, description: 'Page number (1-based)' })
  @ApiQuery({ name: 'page_size', required: false, type: Number, description: 'Number of items per page' })
  @ApiResponse({ status: 200, description: 'OK', type: [Camera] })
  findAll(
      @Query('filter') filter?: string,
      @Query('current_page') current_page = 1,
      @Query('page_size') page_size = 10,
    ) {
    return this.cameraService.findAll(filter, current_page, page_size);
  }

  @Get(':id')
  @ApiOperation({ summary: 'GET CAMERA BY ID', description: 'Get camera details' })
  @ApiResponse({ status: 200, description: 'OK', type: Camera })
  @ApiResponse({ status: 404, description: 'Not Found' })
  findOne(@Param('id') id: string) {
    return this.cameraService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'UPDATE CAMERA', description: 'Update camera details' })
  @ApiResponse({ status: 200, description: 'Updated', type: Camera })
  @ApiResponse({ status: 404, description: 'Not Found' })
  update(@Param('id') id: string, @Body() updateCameraDto: UpdateCameraDto) {
    return this.cameraService.update(+id, updateCameraDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'DELETE CAMERA', description: 'Remove a camera' })
  @ApiResponse({ status: 200, description: 'Deleted', schema: { example: { message: 'Camera deleted' } } })
  @ApiResponse({ status: 404, description: 'Not Found' })
  remove(@Param('id') id: string) {
    return this.cameraService.remove(+id);
  }

  @Get('floor/:floorNum')
  @ApiOperation({ summary: 'GET CAMERAS BY FLOOR', description: 'List cameras on a specific floor' })
  @ApiResponse({ status: 200, description: 'OK', type: [Camera] })
  findByFloor(@Param('floorNum') floorNum: string) {
    return this.cameraService.findByFloor(+floorNum);
  }
}