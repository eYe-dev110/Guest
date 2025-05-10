import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConstantDto } from './dto/create-constant.dto';
import { UpdateConstantDto } from './dto/update-constant.dto';
import { Constant } from './entities/constant.entity';

@Injectable()
export class ConstantService {
  private readonly logger = new Logger('ConstantService');

  constructor(private prisma: PrismaService) {}

  async create(createConstantDto: CreateConstantDto): Promise<Constant> {
    try {
      // Check if constant name already exists
      const existing = await this.prisma.constant.findUnique({
        where: { name: createConstantDto.name },
      });
      if (existing) {
        throw new ConflictException(`Constant '${createConstantDto.name}' already exists`);
      }

      return await this.prisma.constant.create({
        data: createConstantDto,
      });
    } catch (error) {
      this.logger.error(`CREATE: ${error.message}`);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create constant');
    }
  }

  async findAll(): Promise<Constant[]> {
    return this.prisma.constant.findMany();
  }

  async findOne(id: number): Promise<Constant> {
    const constant = await this.prisma.constant.findUnique({
      where: { id },
    });
    if (!constant) {
      throw new NotFoundException(`Constant #${id} not found`);
    }
    return constant;
  }

  async findByName(name: string): Promise<Constant> {
    const constant = await this.prisma.constant.findUnique({
      where: { name },
    });
    if (!constant) {
      throw new NotFoundException(`Constant '${name}' not found`);
    }
    return constant;
  }

  async update(id: number, updateConstantDto: UpdateConstantDto): Promise<Constant> {
    try {
      if (updateConstantDto.name) {
        // Check if new name conflicts with existing constants
        const existing = await this.prisma.constant.findFirst({
          where: {
            name: updateConstantDto.name,
            NOT: { id },
          },
        });
        if (existing) {
          throw new ConflictException(`Constant '${updateConstantDto.name}' already exists`);
        }
      }

      return await this.prisma.constant.update({
        where: { id },
        data: updateConstantDto,
      });
    } catch (error) {
      this.logger.error(`UPDATE: ${error.message}`);
      if (error.code === 'P2025') {
        throw new NotFoundException(`Constant #${id} not found`);
      }
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to update constant');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      await this.prisma.constant.delete({ where: { id } });
      return { message: 'Constant deleted' };
    } catch (error) {
      this.logger.error(`DELETE: ${error.message}`);
      if (error.code === 'P2025') {
        throw new NotFoundException(`Constant #${id} not found`);
      }
      throw new BadRequestException('Failed to delete constant');
    }
  }
}