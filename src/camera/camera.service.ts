import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCameraDto } from './dto/create-camera.dto';
import { UpdateCameraDto } from './dto/update-camera.dto';
import { Camera } from './entities/camera.entity';

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

  async findAll(): Promise<Camera[]> {
    return this.prisma.camera.findMany();
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