import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateConstantDto } from './create-constant.dto';
import { IsOptional } from 'class-validator';

export class UpdateConstantDto extends PartialType(CreateConstantDto) {
  @ApiProperty({
    description: 'Update timestamp (auto-handled by DB)',
    required: false,
    readOnly: true,
  })
  @IsOptional()
  updated_at?: Date;
}