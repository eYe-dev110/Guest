import { ApiProperty } from '@nestjs/swagger';

export class CustomerRoleCountDto {
  @ApiProperty({
    description: 'The role type of the customer',
    example: 'user'
  })
  role: string;

  @ApiProperty({
    description: 'Number of customers with this role seen today',
    example: 42
  })
  count: number;
}

export class DailyRoleCountDto {
  @ApiProperty({
    description: 'Date in YYYY-MM-DD format',
    example: '2023-11-15'
  })
  date: string;

  @ApiProperty({
    type: [CustomerRoleCountDto],
    description: 'Counts by role for this date'
  })
  counts: CustomerRoleCountDto[];
}