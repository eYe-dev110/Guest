import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsDate } from 'class-validator';

export class Role {
  @ApiProperty({
    description: 'Role ID',
    example: 1,
    required: true,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Role name',
    example: 'admin',
    required: true,
  })
  @IsString()
  name: string;

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