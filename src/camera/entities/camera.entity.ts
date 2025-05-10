import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsDate } from 'class-validator';

export class Camera {
  @ApiProperty({
    description: 'Camera ID',
    example: 1,
    required: true,
  })
  @IsInt()
  id: number;

  @ApiProperty({
    description: 'Camera title',
    example: 'Main Entrance',
    required: true,
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Camera subtitle',
    example: 'North View',
    required: true,
  })
  @IsString()
  sub_title: string;

  @ApiProperty({
    description: 'Floor number',
    example: 1,
    required: true,
  })
  @IsInt()
  floor_num: number;

  @ApiProperty({
    description: 'Floor sub-number',
    example: 2,
    required: true,
  })
  @IsInt()
  floor_sub_num: number;

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