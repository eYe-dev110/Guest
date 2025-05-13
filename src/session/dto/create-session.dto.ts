import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({
    description: 'Customer ID (foreign key)',
    example: 123456789,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  customer_id: number;

  @ApiProperty({
    description: 'Day session identifier',
    example: 'morning',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  day_session: number[];

  @ApiProperty({
    description: 'Session date',
    example: '2023-01-01T09:00:00.000Z',
    required: true,
  })
  @IsNotEmpty()
  session_date: Date;
}