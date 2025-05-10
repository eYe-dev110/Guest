import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RoleService {
  private readonly logger = new Logger('RoleService');

  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    try {
      return await this.prisma.role.create({
        data: createRoleDto,
      });
    } catch (error) {
      this.logger.error(`CREATE: ${error.message}`);
      if (error.code === 'P2002') {
        throw new BadRequestException('Role name already exists');
      }
      throw new BadRequestException('Failed to create role');
    }
  }

  async findAll(): Promise<Role[]> {
    return this.prisma.role.findMany();
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });
    if (!role) {
      throw new NotFoundException(`Role #${id} not found`);
    }
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    try {
      return await this.prisma.role.update({
        where: { id },
        data: updateRoleDto,
      });
    } catch (error) {
      this.logger.error(`UPDATE: ${error.message}`);
      if (error.code === 'P2025') {
        throw new NotFoundException(`Role #${id} not found`);
      }
      throw new BadRequestException('Failed to update role');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      await this.prisma.role.delete({ where: { id } });
      return { message: 'Role deleted' };
    } catch (error) {
      this.logger.error(`DELETE: ${error.message}`);
      if (error.code === 'P2025') {
        throw new NotFoundException(`Role #${id} not found`);
      }
      throw new BadRequestException('Failed to delete role');
    }
  }
}