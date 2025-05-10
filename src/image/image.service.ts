import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { Image } from './entities/image.entity';
import { ImageType } from '@prisma/client';

@Injectable()
export class ImageService {
  private readonly logger = new Logger('ImageService');

  constructor(private prisma: PrismaService) {}

  async create(createImageDto: CreateImageDto): Promise<Image> {
    try {
      // Verify relations exist (only if IDs are provided)
      await Promise.all([
        // Only verify customer if customer_id exists
        ...(createImageDto.customer_id ? [
          this.prisma.customer.findUniqueOrThrow({
            where: { id: createImageDto.customer_id }
          })
        ] : []),
        
        // Optional camera verification
        ...(createImageDto.camera_id ? [
          this.prisma.camera.findUniqueOrThrow({
            where: { id: createImageDto.camera_id }
          })
        ] : []),
        
        // Optional history verification
        ...(createImageDto.history_id ? [
          this.prisma.history.findUniqueOrThrow({
            where: { id: createImageDto.history_id }
          })
        ] : [])
      ]);

      return await this.prisma.image.create({
        data: {
          url: createImageDto.url,
          image_type: createImageDto.image_type,
          // Only include customer_id if provided
          ...(createImageDto.customer_id && { 
            customer: { connect: { id: createImageDto.customer_id } }
          }),
          // Optional relations
          ...(createImageDto.camera_id && {
            camera: { connect: { id: createImageDto.camera_id } }
          }),
          ...(createImageDto.history_id && {
            history: { connect: { id: createImageDto.history_id } }
          })
        },
        include: {
          customer: !!createImageDto.customer_id,
          camera: !!createImageDto.camera_id,
          history: !!createImageDto.history_id
        }
      });
    } catch (error) {
      this.logger.error(`CREATE: ${error.message}`);
      if (error.code === 'P2003') {
        const entity = error.meta.field_name.replace(/_id$/, '');
        throw new NotFoundException(`${entity.charAt(0).toUpperCase() + entity.slice(1)} not found`);
      }
      throw new BadRequestException('Failed to create image record');
    }
  }

  async findAll(): Promise<Image[]> {
    return this.prisma.image.findMany();
  }

  async findOne(id: number): Promise<Image> {
    const image = await this.prisma.image.findUnique({
      where: { id }
    });
    if (!image) {
      throw new NotFoundException(`Image #${id} not found`);
    }
    return image;
  }

  async update(id: number, updateImageDto: UpdateImageDto): Promise<Image> {
    try {
      // Verify any updated foreign keys exist
      if (updateImageDto.customer_id) {
        await this.prisma.customer.findUniqueOrThrow({
          where: { id: updateImageDto.customer_id }
        });
      }
      if (updateImageDto.camera_id) {
        await this.prisma.camera.findUniqueOrThrow({
          where: { id: updateImageDto.camera_id }
        });
      }
      if (updateImageDto.history_id) {
        await this.prisma.history.findUniqueOrThrow({
          where: { id: updateImageDto.history_id }
        });
      }

      return await this.prisma.image.update({
        where: { id },
        data: updateImageDto
      });
    } catch (error) {
      this.logger.error(`UPDATE: ${error.message}`);
      if (error.code === 'P2025') {
        throw new NotFoundException(`Image #${id} not found`);
      }
      if (error.code === 'P2003') {
        const entity = error.meta.field_name.replace(/_id$/, '');
        throw new NotFoundException(`${entity.charAt(0).toUpperCase() + entity.slice(1)} not found`);
      }
      throw new BadRequestException('Failed to update image record');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      await this.prisma.image.delete({ where: { id } });
      return { message: 'Image deleted' };
    } catch (error) {
      this.logger.error(`DELETE: ${error.message}`);
      if (error.code === 'P2025') {
        throw new NotFoundException(`Image #${id} not found`);
      }
      throw new BadRequestException('Failed to delete image record');
    }
  }

  async findByCustomer(customerId: number): Promise<Image[]> {
    try {
      await this.prisma.customer.findUniqueOrThrow({
        where: { id: customerId }
      });
      return this.prisma.image.findMany({
        where: { customer_id: customerId },
        orderBy: { created_at: 'desc' }
      });
    } catch (error) {
      this.logger.error(`FIND_BY_CUSTOMER: ${error.message}`);
      if (error.code === 'P2025') {
        throw new NotFoundException('Customer not found');
      }
      throw new BadRequestException('Failed to fetch images');
    }
  }

  async findByHistory(historyId: number): Promise<Image[]> {
    try {
      await this.prisma.history.findUniqueOrThrow({
        where: { id: historyId }
      });
      return this.prisma.image.findMany({
        where: { history_id: historyId },
        orderBy: { created_at: 'desc' }
      });
    } catch (error) {
      this.logger.error(`FIND_BY_HISTORY: ${error.message}`);
      if (error.code === 'P2025') {
        throw new NotFoundException('History record not found');
      }
      throw new BadRequestException('Failed to fetch images');
    }
  }

  async findByType(imageType: ImageType): Promise<Image[]> {
    return this.prisma.image.findMany({
      where: { image_type: imageType },
      orderBy: { created_at: 'desc' }
    });
  }
}