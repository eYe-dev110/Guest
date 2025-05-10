import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateCameraDto {
  @ApiProperty({
    description: 'Camera title',
    example: 'Main Entrance',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Camera subtitle',
    example: 'North View',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  sub_title: string;

  @ApiProperty({
    description: 'Floor number',
    example: 1,
    required: true,
  })
  @IsInt()
  @IsNotEmpty()
  floor_num: number;

  @ApiProperty({
    description: 'Floor sub-number',
    example: 2,
    required: true,
  })
  @IsInt()
  @IsNotEmpty()
  floor_sub_num: number;
}