import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoliUserit, StatusiUserit, User } from '@prisma/client';
import { AuthenticatedRequest } from '../types/authenticated-request';
import { RolesGuard } from './roles.guard';

function createContext(staffUser: User): ExecutionContext {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({
      getRequest: () => ({ staffUser }) as AuthenticatedRequest,
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  const staffUser: User = {
    id: 1,
    clerk_user_id: 'user_test',
    emri_nofka: 'admin',
    roli: RoliUserit.super_admin,
    statusi: StatusiUserit.aktiv,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  };

  it('lejon rolin e kërkuar', () => {
    const reflector = {
      getAllAndOverride: jest.fn(() => [RoliUserit.super_admin]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(createContext(staffUser))).toBe(true);
  });

  it('refuzon një rol që nuk lejohet', () => {
    const reflector = {
      getAllAndOverride: jest.fn(() => [RoliUserit.moderator]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(() => guard.canActivate(createContext(staffUser))).toThrow(
      ForbiddenException,
    );
  });
});
