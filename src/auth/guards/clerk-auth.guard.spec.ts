import { verifyToken } from '@clerk/backend';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RoliUserit, StatusiUserit, User } from '@prisma/client';
import { UsersService } from '../../users/users.service';
import { AuthenticatedRequest } from '../types/authenticated-request';
import { ClerkAuthGuard } from './clerk-auth.guard';

jest.mock('@clerk/backend', () => ({
  verifyToken: jest.fn(),
}));

const verifiedToken = jest.mocked(verifyToken);

function createContext(
  request: Partial<AuthenticatedRequest>,
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
}

describe('ClerkAuthGuard', () => {
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

  const config = {
    get: jest.fn((key: string, fallback?: string) => {
      const values: Record<string, string> = {
        CLERK_SECRET_KEY: 'secret_test',
        CLERK_AUTHORIZED_PARTIES: 'http://localhost:5173',
      };

      return values[key] ?? fallback;
    }),
  } as unknown as ConfigService;

  const findActiveByClerkUserId = jest.fn();
  const usersService = {
    findActiveByClerkUserId,
  } as unknown as UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('refuzon kërkesën pa Bearer token', async () => {
    const guard = new ClerkAuthGuard(config, usersService);
    const context = createContext({ headers: {} });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('bashkëngjit përdoruesin lokal kur token-i është i vlefshëm', async () => {
    verifiedToken.mockResolvedValue({ sub: 'user_test' } as never);
    findActiveByClerkUserId.mockResolvedValue(staffUser);

    const request = {
      headers: { authorization: 'Bearer token_test' },
    } as AuthenticatedRequest;
    const guard = new ClerkAuthGuard(config, usersService);

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(request.clerkUserId).toBe('user_test');
    expect(request.staffUser).toEqual(staffUser);
  });
});
