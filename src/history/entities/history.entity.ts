import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsDate } from 'class-validator';

export class History {
  @ApiProperty({
    description: 'History record ID',
    example: 1,
    required: true,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Customer ID (foreign key)',
    example: 123456789,
    required: true,
  })
  @IsNumber()
  customer_id: number;

  @ApiProperty({
    description: 'Camera ID (foreign key)',
    example: 1,
    required: true,
  })
  @IsNumber()
  camera_id: number;

  @ApiProperty({
    description: 'Timestamp when customer was seen',
    example: '2023-01-01T09:00:00.000Z',
    required: true,
  })
  @IsDate()
  seen_at: Date;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
    required: true,
  })
  @IsDate()
  created_at: Date;
}