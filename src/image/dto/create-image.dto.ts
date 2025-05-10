import { ApiProperty } from '@nestjs/swagger';
import { ImageType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateImageDto {
  @ApiProperty({
    description: 'Customer ID (foreign key)',
    example: 123456789,
    required: false
  })
  @IsNumber()
  @IsOptional()
  customer_id: number;

  @ApiProperty({
    description: 'Camera ID (foreign key)',
    example: 1,
    required: false
  })
  @IsNumber()
  @IsOptional()
  camera_id: number;

  @ApiProperty({
    description: 'History ID (foreign key)',
    example: 1,
    required: false
  })
  @IsNumber()
  @IsOptional()
  history_id: number;

  @ApiProperty({
    description: 'Image type',
    enum: ImageType,
    default: ImageType.camera,
    required: false
  })
  @IsEnum(ImageType)
  @IsOptional()
  image_type?: ImageType;

  @ApiProperty({
    description: 'Image URL',
    example: 'https://storage.example.com/images/123.jpg',
    required: true
  })
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  url: string;
}