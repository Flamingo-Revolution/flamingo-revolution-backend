import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface TurnstileResponse {
  success: boolean;
}

@Injectable()
export class CaptchaService {
  private readonly siteverifyUrl =
    'https://challenges.cloudflare.com/turnstile/v0/siteverify';

  constructor(private readonly config: ConfigService) {}

  async verifyTurnstile(token: string, ip: string): Promise<void> {
    const secret = this.config.get<string>('TURNSTILE_SECRET_KEY');

    if (!secret) {
      throw new InternalServerErrorException(
        'TURNSTILE_SECRET_KEY nuk është konfiguruar.',
      );
    }

    try {
      const response = await fetch(this.siteverifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret,
          response: token,
          remoteip: ip,
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new ServiceUnavailableException(
          'Shërbimi CAPTCHA nuk është i disponueshëm.',
        );
      }

      const result = (await response.json()) as TurnstileResponse;

      if (!result.success) {
        throw new BadRequestException(
          'Verifikimi CAPTCHA dështoi. Provo përsëri.',
        );
      }
    } catch (error: unknown) {
      if (
        error instanceof BadRequestException ||
        error instanceof ServiceUnavailableException
      ) {
        throw error;
      }

      throw new ServiceUnavailableException(
        'Shërbimi CAPTCHA nuk është i disponueshëm.',
      );
    }
  }
}
