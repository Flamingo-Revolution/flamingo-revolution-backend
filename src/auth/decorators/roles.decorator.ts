import { SetMetadata } from '@nestjs/common';
import { RoliUserit } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoliUserit[]) => SetMetadata(ROLES_KEY, roles);
