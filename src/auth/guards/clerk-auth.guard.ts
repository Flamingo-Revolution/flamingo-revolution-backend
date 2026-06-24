import { verifyToken } from '@clerk/backend';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { AuthenticatedRequest } from '../types/authenticated-request';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.getBearerToken(request.headers.authorization);
    const secretKey = this.config.get<string>('CLERK_SECRET_KEY');
    const authorizedParties = this.getAuthorizedParties();

    if (!secretKey || authorizedParties.length === 0) {
      throw new InternalServerErrorException(
        'Konfigurimi i Clerk në backend nuk është i plotë.',
      );
    }

    try {
      const payload = await verifyToken(token, {
        secretKey,
        authorizedParties,
      });

      const staffUser = await this.usersService.findActiveByClerkUserId(
        payload.sub,
      );

      if (!staffUser) {
        throw new UnauthorizedException(
          'Përdoruesi nuk është aktiv në sistemin lokal.',
        );
      }

      request.clerkUserId = payload.sub;
      request.staffUser = staffUser;

      return true;
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Token-i i Clerk nuk është i vlefshëm.');
    }
  }

  private getBearerToken(authorization?: string): string {
    const [type, token] = authorization?.trim().split(/\s+/) ?? [];

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Mungon Bearer token-i.');
    }

    return token;
  }

  private getAuthorizedParties(): string[] {
    const value = this.config.get<string>('CLERK_AUTHORIZED_PARTIES', '');

    return value
      .split(',')
      .map((party) => party.trim())
      .filter(Boolean);
  }
}
