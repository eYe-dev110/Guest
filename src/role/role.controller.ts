import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from './entities/role.entity';

@ApiBearerAuth()
@ApiTags('Roles')
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiOperation({ summary: 'CREATE ROLE', description: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Created', type: Role })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'GET ALL ROLES', description: 'List all roles' })
  @ApiResponse({ status: 200, description: 'OK', type: [Role] })
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'GET ROLE BY ID', description: 'Get role details by ID' })
  @ApiResponse({ status: 200, description: 'OK', type: Role })
  @ApiResponse({ status: 404, description: 'Not Found' })
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'UPDATE ROLE', description: 'Update role by ID' })
  @ApiResponse({ status: 200, description: 'Updated', type: Role })
  @ApiResponse({ status: 404, description: 'Not Found' })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'DELETE ROLE', description: 'Delete role by ID' })
  @ApiResponse({ status: 200, description: 'Deleted', schema: { example: { message: 'Role deleted' } } })
  @ApiResponse({ status: 404, description: 'Not Found' })
  remove(@Param('id') id: string) {
    return this.roleService.remove(+id);
  }
}