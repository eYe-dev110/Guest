import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ConstantService } from './constant.service';
import { CreateConstantDto } from './dto/create-constant.dto';
import { UpdateConstantDto } from './dto/update-constant.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Constant } from './entities/constant.entity';

@ApiBearerAuth()
@ApiTags('Constants')
@Controller('constants')
export class ConstantController {
  constructor(private readonly constantService: ConstantService) {}

  @Post()
  @ApiOperation({ summary: 'CREATE CONSTANT', description: 'Create a new system constant' })
  @ApiResponse({ status: 201, description: 'Created', type: Constant })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Constant name already exists' })
  create(@Body() createConstantDto: CreateConstantDto) {
    return this.constantService.create(createConstantDto);
  }

  @Get()
  @ApiOperation({ summary: 'GET ALL CONSTANTS', description: 'List all system constants' })
  @ApiQuery({ name: 'filter', required: false, description: 'Filter cameras  by search fields' })
  @ApiQuery({ name: 'current_page', required: false, type: Number, description: 'Page number (1-based)' })
  @ApiQuery({ name: 'page_size', required: false, type: Number, description: 'Number of items per page' })
  @ApiResponse({ status: 200, description: 'OK', type: [Constant] })
  findAll(
    @Query('filter') filter?: string,
    @Query('current_page') current_page = 1,
    @Query('page_size') page_size = 10,
  ) {
    return this.constantService.findAll(filter, current_page, page_size);
  }

  @Get(':id')
  @ApiOperation({ summary: 'GET CONSTANT BY ID', description: 'Get constant details' })
  @ApiResponse({ status: 200, description: 'OK', type: Constant })
  @ApiResponse({ status: 404, description: 'Not Found' })
  findOne(@Param('id') id: string) {
    return this.constantService.findOne(+id);
  }

  @Get('name/:name')
  @ApiOperation({ summary: 'GET CONSTANT BY NAME', description: 'Get constant by its name' })
  @ApiResponse({ status: 200, description: 'OK', type: Constant })
  @ApiResponse({ status: 404, description: 'Not Found' })
  findByName(@Param('name') name: string) {
    return this.constantService.findByName(name);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'UPDATE CONSTANT', description: 'Update constant value' })
  @ApiResponse({ status: 200, description: 'Updated', type: Constant })
  @ApiResponse({ status: 404, description: 'Not Found' })
  update(@Param('id') id: string, @Body() updateConstantDto: UpdateConstantDto) {
    return this.constantService.update(+id, updateConstantDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'DELETE CONSTANT', description: 'Remove a system constant' })
  @ApiResponse({ status: 200, description: 'Deleted', schema: { example: { message: 'Constant deleted' } } })
  @ApiResponse({ status: 404, description: 'Not Found' })
  remove(@Param('id') id: string) {
    return this.constantService.remove(+id);
  }
}