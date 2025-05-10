import { Injectable, BadRequestException, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { Prisma } from '@prisma/client';

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

  async findAll(filter?: string, current_page = 1, page_size = 10) {
    try {
      current_page = Number(current_page)
      page_size = Number(page_size)
      const skip = (current_page - 1) * page_size;
      
      // Create base where condition
      const whereCondition: Prisma.RoleWhereInput = {};
      
      // Add filtering if provided
      if (filter) {
        
        whereCondition.OR = [
          // Text search
          { name: { contains: filter, mode: 'insensitive' } },
        ];
      }
  
      const [cameras, total] = await this.prisma.$transaction([
        this.prisma.role.findMany({
          where: whereCondition,
          skip,
          take: page_size,
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            name: true,
            created_at: true,
            updated_at: true,
          },
        }),
        this.prisma.role.count({ where: whereCondition }),
      ]);
  
      return {
        data: cameras,
        meta: {
          total,
          current_page,
          page_size,
          total_pages: Math.ceil(total / page_size),
        },
      };
    } catch (error) {
      this.logger.error(`GET: error: ${error}`);
      throw new InternalServerErrorException('Failed to retrieve roles');
    }
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