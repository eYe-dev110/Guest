import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateConstantDto {
  @ApiProperty({
    description: 'Constant name (unique identifier)',
    example: 'MAX_LOGIN_ATTEMPTS',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Constant value',
    example: '5',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  value: string;
}