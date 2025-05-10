import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ImageService } from './image.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Image } from './entities/image.entity';
import { ImageType } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/strategies/jwt.authguard';
import { UserRoleGuard } from 'src/auth/guards/user-role/user-role.guard';

@ApiBearerAuth()
@ApiTags('Images')
@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post()
  @ApiOperation({ summary: 'CREATE IMAGE', description: 'Create new image record' })
  @ApiResponse({ status: 201, description: 'Created', type: Image })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Customer/Camera/History not found' })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  create(@Body() createImageDto: CreateImageDto) {
    return this.imageService.create(createImageDto);
  }

  @Get()
  @ApiOperation({ summary: 'GET ALL IMAGES', description: 'List all image records' })
  @ApiQuery({ name: 'filter', required: false, description: 'Filter images by search fields' })
  @ApiQuery({ name: 'start_date', required: false, description: 'Filter images by created_at range' })
  @ApiQuery({ name: 'end_date', required: false, description: 'Filter images by created_at range' })
  @ApiQuery({ name: 'current_page', required: false, type: Number, description: 'Page number (1-based)' })
  @ApiQuery({ name: 'page_size', required: false, type: Number, description: 'Number of items per page' })
  @ApiResponse({ status: 200, description: 'OK', type: [Image] })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  findAll(
    @Query('filter') filter?: string,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('current_page') current_page = 1,
    @Query('page_size') page_size = 10,
  ) {
    return this.imageService.findAll(filter, start_date, end_date, current_page, page_size);
  }

  @Get(':id')
  @ApiOperation({ summary: 'GET IMAGE BY ID', description: 'Get specific image record' })
  @ApiResponse({ status: 200, description: 'OK', type: Image })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  findOne(@Param('id') id: string) {
    return this.imageService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'UPDATE IMAGE', description: 'Update image record' })
  @ApiResponse({ status: 200, description: 'Updated', type: Image })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  update(@Param('id') id: string, @Body() updateImageDto: UpdateImageDto) {
    return this.imageService.update(+id, updateImageDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'DELETE IMAGE', description: 'Remove image record' })
  @ApiResponse({ status: 200, description: 'Deleted', schema: { example: { message: 'Image deleted' } } })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  remove(@Param('id') id: string) {
    return this.imageService.remove(+id);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'GET CUSTOMER IMAGES', description: 'Get all images for a customer' })
  @ApiResponse({ status: 200, description: 'OK', type: [Image] })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  findByCustomer(@Param('customerId') customerId: string) {
    return this.imageService.findByCustomer(+customerId);
  }

  @Get('history/:historyId')
  @ApiOperation({ summary: 'GET HISTORY IMAGES', description: 'Get all images for a history record' })
  @ApiResponse({ status: 200, description: 'OK', type: [Image] })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  findByHistory(@Param('historyId') historyId: string) {
    return this.imageService.findByHistory(+historyId);
  }

  @Get('type/:imageType')
  @ApiOperation({ summary: 'GET IMAGES BY TYPE', description: 'Get images by specific type' })
  @ApiResponse({ status: 200, description: 'OK', type: [Image] })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  findByType(@Param('imageType') imageType: ImageType) {
    return this.imageService.findByType(imageType);
  }
}