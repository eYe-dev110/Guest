import { ApiProperty } from '@nestjs/swagger';
import { CustomerRole } from '@prisma/client';
import { IsEnum, IsNumber, IsString, IsDate } from 'class-validator';

export class Customer {
  @ApiProperty({
    description: 'Customer ID',
    example: 123456789,
    required: true,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Customer role',
    enum: CustomerRole,
    example: CustomerRole.user,
    required: true,
  })
  @IsEnum(CustomerRole)
  role: CustomerRole;

  @ApiProperty({
    description: 'Customer name',
    example: 'John Doe',
    required: true,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Additional customer details',
    example: 'Loyal customer since 2020',
    required: false,
  })
  @IsString()
  detail_info?: string;

  @ApiProperty({
    description: 'Last seen timestamp',
    example: '2023-01-01T12:00:00.000Z',
    required: false,
  })
  @IsDate()
  last_seen_at?: Date;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
    required: true,
  })
  @IsDate()
  created_at: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-01-02T00:00:00.000Z',
    required: true,
  })
  @IsDate()
  updated_at: Date;
}