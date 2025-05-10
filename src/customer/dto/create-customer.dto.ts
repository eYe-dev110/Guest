import { ApiProperty } from '@nestjs/swagger';
import { CustomerRole } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Customer role (default: user)',
    enum: CustomerRole,
    default: CustomerRole.user,
    required: false,
  })
  @IsEnum(CustomerRole)
  @IsOptional()
  role?: CustomerRole;

  @ApiProperty({
    description: 'Customer name',
    example: 'John Doe',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Additional customer details (optional)',
    example: 'Loyal customer since 2020',
    required: false,
  })
  @IsString()
  @IsOptional()
  detail_info?: string;
}