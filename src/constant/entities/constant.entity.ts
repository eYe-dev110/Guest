import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsDate } from 'class-validator';

export class Constant {
  @ApiProperty({
    description: 'Constant ID',
    example: 1,
    required: true,
  })
  @IsInt()
  id: number;

  @ApiProperty({
    description: 'Constant name',
    example: 'MAX_LOGIN_ATTEMPTS',
    required: true,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Constant value',
    example: '5',
    required: true,
  })
  @IsString()
  value: string;

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