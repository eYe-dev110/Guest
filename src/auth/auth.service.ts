import { BadRequestException, Injectable, InternalServerErrorException, Logger  } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcryptjs';

import { RegisterUserDto } from './dto/register-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

import { PrismaService } from 'src/prisma/prisma.service';
import { User } from 'src/user/entities/user.entity';


@Injectable()
export class AuthService {

  private readonly logger = new Logger('AuthService');

  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService

  ) { }


  async registerUser(dto: RegisterUserDto): Promise<any> {
    this.logger.log(`POST: user/register: Register user started`);
    // Check if password and passwordConfirmation match
    if (dto.password !== dto.passwordconf) throw new BadRequestException('Passwords do not match');

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

      return {
        user: newuser,
        token: this.getJwtToken({
          id: newuser.id,
        })
      };
      
    } catch (error) {
      if (error.code === 'P2002') {
        this.logger.warn(`POST: auth/register: User already exists: ${dto.user_name}`);
        throw new BadRequestException('User already exists');
      }
      this.logger.error(`POST: auth/register: error: ${error}`);
      throw new InternalServerErrorException('Server error');
    }

  }


  async loginUser(user_name: string, password: string): Promise<any> {
    this.logger.log(`POST: auth/login: Login iniciado: ${user_name}`);
    let user;
    try {
      user = await this.prisma.user.findUniqueOrThrow({
        where: {
          user_name,
        },
        select: {
          id: true,
          user_name: true,
          password: true,
          role: true,
          is_active: true,
          created_at: true,
          updated_at: true,
        }
      });

    } catch (error) {
      this.logger.error(`POST: auth/login: error: ${error}`);
      throw new BadRequestException('Wrong credentials');
    }

    // Compare the provided password with the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new BadRequestException('Wrong credentials');
    }
    
    delete user.password;
    
    this.logger.log(`POST: auth/login: Usuario aceptado: ${user.email}`);
    return {
      user,
      token: this.getJwtToken({
        id: user.id,
      })
    };
  }


  async refreshToken(user: User){
    return {
      user: user,
      token: this.getJwtToken({id: user.id})
    };


  }


  private getJwtToken(payload: JwtPayload) {

    const token = this.jwtService.sign(payload);
    return token;

  }


}





