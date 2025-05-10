import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCameraDto } from './create-camera.dto';
import { IsOptional } from 'class-validator';

export class UpdateCameraDto extends PartialType(CreateCameraDto) {
  @ApiProperty({
    description: 'Update timestamp (auto-handled by DB)',
    required: false,
    readOnly: true,
  })
  @IsOptional()
  updated_at?: Date;
}