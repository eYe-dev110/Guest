import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateHistoryDto {
  @ApiProperty({
    description: 'Customer ID (foreign key)',
    example: 123456789,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  customer_id: number;

  @ApiProperty({
    description: 'Camera ID (foreign key)',
    example: 1,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  camera_id: number;

  @ApiProperty({
    description: 'Timestamp when customer was seen',
    example: '2023-01-01T09:00:00.000Z',
    required: true,
  })
  @IsNotEmpty()
  seen_at: Date;
}