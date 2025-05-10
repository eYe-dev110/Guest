import { Injectable, NotFoundException, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCameraDto } from './dto/create-camera.dto';
import { UpdateCameraDto } from './dto/update-camera.dto';
import { Camera } from './entities/camera.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class CameraService {
  private readonly logger = new Logger('CameraService');

  constructor(private prisma: PrismaService) {}

  async create(createCameraDto: CreateCameraDto): Promise<Camera> {
    try {
      return await this.prisma.camera.create({
        data: createCameraDto,
      });
    } catch (error) {
      this.logger.error(`CREATE: ${error.message}`);
      throw new BadRequestException('Failed to create camera');
    }
  }

  async findAll(filter?: string, current_page = 1, page_size = 10) {
    try {
      current_page = Number(current_page)
      page_size = Number(page_size)
      const skip = (current_page - 1) * page_size;
      
      // Create base where condition
      const whereCondition: Prisma.CameraWhereInput = {};
      
      // Add filtering if provided
      if (filter) {
        const numericValue = Number(filter);
        const isNumeric = !isNaN(numericValue) && filter.trim() !== '';
        
        whereCondition.OR = [
          // Text search
          { title: { contains: filter, mode: 'insensitive' } },
          { sub_title: { contains: filter, mode: 'insensitive' } },
          
          // Numeric search (only if filter is a valid number)
          ...(isNumeric ? [
            { floor_num: { equals: numericValue } },
            { floor_sub_num: { equals: numericValue } }
          ] : [])
        ];
      }
  
      const [cameras, total] = await this.prisma.$transaction([
        this.prisma.camera.findMany({
          where: whereCondition,
          skip,
          take: page_size,
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            title: true,
            sub_title: true,
            floor_num: true,
            floor_sub_num: true,
            created_at: true,
            updated_at: true,
          },
        }),
        this.prisma.camera.count({ where: whereCondition }),
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
      throw new InternalServerErrorException('Failed to retrieve cameras');
    }
  }

  async findOne(id: number): Promise<Camera> {
    const camera = await this.prisma.camera.findUnique({
      where: { id },
    });
    if (!camera) {
      throw new NotFoundException(`Camera #${id} not found`);
    }
    return camera;
  }

  async update(id: number, updateCameraDto: UpdateCameraDto): Promise<Camera> {
    try {
      return await this.prisma.camera.update({
        where: { id },
        data: updateCameraDto,
      });
    } catch (error) {
      this.logger.error(`UPDATE: ${error.message}`);
      if (error.code === 'P2025') {
        throw new NotFoundException(`Camera #${id} not found`);
      }
      throw new BadRequestException('Failed to update camera');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      await this.prisma.camera.delete({ where: { id } });
      return { message: 'Camera deleted' };
    } catch (error) {
      this.logger.error(`DELETE: ${error.message}`);
      if (error.code === 'P2025') {
        throw new NotFoundException(`Camera #${id} not found`);
      }
      throw new BadRequestException('Failed to delete camera');
    }
  }

  async findByFloor(floorNum: number): Promise<Camera[]> {
    return this.prisma.camera.findMany({
      where: { floor_num: floorNum },
    });
  }
}