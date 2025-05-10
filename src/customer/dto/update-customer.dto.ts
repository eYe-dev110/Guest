import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCustomerDto } from './create-customer.dto';
import { IsOptional } from 'class-validator';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @ApiProperty({
    description: 'Last seen timestamp (auto-updated)',
    required: false,
    readOnly: true,
  })
  @IsOptional()
  last_seen_at?: Date;
}