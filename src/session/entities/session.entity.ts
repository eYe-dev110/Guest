import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsDate } from 'class-validator';

export class Session {
  @ApiProperty({
    description: 'Session ID',
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
    description: 'Day session identifier',
    example: 'morning',
    required: true,
  })
  @IsString()
  day_session: number[];

  @ApiProperty({
    description: 'Session date',
    example: '2023-01-01T09:00:00.000Z',
    required: true,
  })
  @IsDate()
  session_date: Date;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
    required: true,
  })
  @IsDate()
  created_at: Date;
}