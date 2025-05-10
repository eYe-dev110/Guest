import { ApiProperty } from '@nestjs/swagger';
import { ImageType } from '@prisma/client';
import { IsEnum, IsNumber, IsString, IsUrl, IsDate } from 'class-validator';

export class Image {
  @ApiProperty({
    description: 'Image ID',
    example: 1,
    required: true
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Customer ID',
    example: 123456789
  })
  @IsNumber()
  customer_id: number;

  @ApiProperty({
    description: 'Camera ID',
    example: 1
  })
  @IsNumber()
  camera_id: number;

  @ApiProperty({
    description: 'History ID',
    example: 1
  })
  @IsNumber()
  history_id: number;

  @ApiProperty({
    description: 'Customer role',
    enum: ImageType,
    example: ImageType.camera,
    required: true,
  })
  @IsEnum(ImageType)
  image_type: ImageType;

  @ApiProperty({
    description: 'Image URL',
    example: 'https://storage.example.com/images/123.jpg',
    required: true
  })
  @IsUrl()
  url: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
    required: true
  })
  @IsDate()
  created_at: Date;
}