import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from './entities/role.entity';
import { JwtAuthGuard } from 'src/auth/strategies/jwt.authguard';
import { UserRoleGuard } from 'src/auth/guards/user-role/user-role.guard';

@ApiBearerAuth()
@ApiTags('Roles')
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiOperation({ summary: 'CREATE ROLE', description: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Created', type: Role })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'GET ALL ROLES', description: 'List all roles' })
  @ApiQuery({ name: 'filter', required: false, description: 'Filter roles  by search fields' })
  @ApiQuery({ name: 'current_page', required: false, type: Number, description: 'Page number (1-based)' })
  @ApiQuery({ name: 'page_size', required: false, type: Number, description: 'Number of items per page' })
  @ApiResponse({ status: 200, description: 'OK', type: [Role] })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  findAll(
    @Query('filter') filter?: string,
    @Query('current_page') current_page = 1,
    @Query('page_size') page_size = 10,
  ) {
    return this.roleService.findAll(filter, current_page, page_size);
  }

  @Get(':id')
  @ApiOperation({ summary: 'GET ROLE BY ID', description: 'Get role details by ID' })
  @ApiResponse({ status: 200, description: 'OK', type: Role })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'UPDATE ROLE', description: 'Update role by ID' })
  @ApiResponse({ status: 200, description: 'Updated', type: Role })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'DELETE ROLE', description: 'Delete role by ID' })
  @ApiResponse({ status: 200, description: 'Deleted', schema: { example: { message: 'Role deleted' } } })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  remove(@Param('id') id: string) {
    return this.roleService.remove(+id);
  }
}