import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';

import * as bcrypt from 'bcryptjs';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from './entities/user.entity';
import { Role } from '@prisma/client';


@Injectable()
export class UserService {

  private readonly logger = new Logger('UserService');

  constructor(
    private prisma: PrismaService,

  ) { }

  async create(dto: CreateUserDto) {
    this.logger.log(`POST: user/register: Register user started`);
    
    // Check if password and passwordConfirmation match
    if (dto.password !== dto.passwordconf) throw new BadRequestException('Passwords do not match');

    // Check Role
    // if (dto.role_id.n) throw new BadRequestException('Invalid role');

    //Hash the password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      
      const {passwordconf , ...newUserData} = dto
      newUserData.password = hashedPassword;

      const newuser = await this.prisma.user.create({
        data: newUserData,
        select: {
          id: true,
          user_name: true,
          role: true,
          is_active: true,
          created_at: true,
          updated_at: true,
        }
      });

      return newuser;
      
    } catch (error) {
      this.prismaErrorHanler(error, "POST", dto.user_name);
      this.logger.error(`POST: error: ${error}`);
      throw new InternalServerErrorException('Server error');
    }
  }

  async findAll() {
    
    try {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          user_name: true,
          role: true,
          is_active: true,
          created_at: true,
          updated_at: true,
        }
      });
      return users;
    } catch (error) {
      this.logger.error(`GET: error: ${error}`);
      throw new InternalServerErrorException('Server error');
    }
        
  }

  async findOne(field: string, value: string, user: User) {
        
    if (value !== user[field] && user.role.name !== 'system_admin') throw new UnauthorizedException('Unauthorized');
    
    const whereData = field === 'id' ? {id: Number(value)} : {user_name: value};
    
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: whereData,
        select: {
          id: true,
          user_name: true,
          role: true,
          is_active: true,
          created_at: true,
          updated_at: true,
        }
      });

      return user;

    } catch (error) {
      this.prismaErrorHanler(error, "GET", value);
      this.logger.error(`GET/{id}: error: ${error}`);
      throw new InternalServerErrorException('Server error');
    }
    
  }

  async update(field: string, value: string, dto: UpdateUserDto, user: User) {

    if (value !== user[field] && user.role.name !== 'system_admin') throw new UnauthorizedException('Unauthorized');
    
    const whereData = field === 'id' ? {id: Number(value)} : {user_name: value};
    
    // if (user.role.name !== 'system_admin') delete dto.role;

    const {passwordconf , ...newUserData} = dto

    // Check if password and passwordConfirmation match
    if (dto.password){
      if(dto.password !== passwordconf) throw new BadRequestException('Passwords do not match');
      //Hash the password
      newUserData.password = await bcrypt.hash(dto.password, 10);
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: whereData,
        data: newUserData,
        select: {
          id: true,
          user_name: true,
          role: true,
          is_active: true,
          created_at: true,
          updated_at: true,
        }
      });
      return updatedUser;
      
    } catch (error) {
      this.prismaErrorHanler(error, "PATCH", value);
      this.logger.error(`PATCH: error: ${error}`);
      throw new InternalServerErrorException('Server error');
    }
     
  }

  async remove(field: string, value: string, user: User) {
    if (value !== user[field] && user.role.name !== 'system_admin') throw new UnauthorizedException('Unauthorized');

    const whereData = field === 'id' ? {id: Number(value)} : {user_name: value};

    try {
      const deletedUser = await this.prisma.user.delete({
        where: whereData,
        select:{
          id: true,
          user_name: true,
          role: true,
          is_active: true,
          created_at: true,
          updated_at: true,
        }
      });
      
      this.logger.warn(`DELETE: ${JSON.stringify(deletedUser)}`);
      return {message: "User deleted"}
      
    } catch (error) {
      this.prismaErrorHanler(error, "DELETE", value);
      this.logger.error(`DELETE: error: ${error}`);
      throw new InternalServerErrorException('Server error');
    }


  }
  
  prismaErrorHanler = (error: any, method: string, value: string = null) => { 
   if (error.code === 'P2002') {
     this.logger.warn(`${method}: User already exists: ${value}`);
     throw new BadRequestException('User already exists');
   }
   if (error.code === 'P2025') {
     this.logger.warn(`${method}: User not found: ${value}`);
     throw new BadRequestException('User not found');
   }
  }

}

