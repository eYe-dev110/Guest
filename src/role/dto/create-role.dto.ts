import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Role name (unique)',
    example: 'admin',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
}