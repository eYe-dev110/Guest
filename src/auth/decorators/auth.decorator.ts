import { UseGuards, applyDecorators } from '@nestjs/common';

import { RolProtected } from './rol-protected.decorator';
import { UserRoleGuard } from '../guards/user-role/user-role.guard';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../guards/user-role/jwt-auth.guard';

export function Auth(...roles: Role[]) {

  return applyDecorators(
    RolProtected(...roles),
    UseGuards(JwtAuthGuard, UserRoleGuard)
  );
}