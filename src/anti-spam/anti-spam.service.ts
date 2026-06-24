import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LlojiVeprimitAntiSpam, Prisma, PrismaClient } from '@prisma/client';
import { createHmac } from 'node:crypto';

type DatabaseClient = Prisma.TransactionClient | PrismaClient;

@Injectable()
export class AntiSpamService {
  constructor(private readonly config: ConfigService) {}

  createHash(value: string): string {
    const secret = this.config.get<string>('HASH_SECRET');

    if (!secret) {
      throw new InternalServerErrorException(
        'HASH_SECRET nuk është konfiguruar.',
      );
    }

    return createHmac('sha256', secret).update(value).digest('hex');
  }

  async ensureCandidateProposalAllowed(
    database: DatabaseClient,
    fingerprintHash: string,
    ipHash: string,
  ): Promise<void> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const baseWhere = {
      lloji_veprimit: LlojiVeprimitAntiSpam.propozim_kandidati,
      created_at: {
        gte: since,
      },
    };

    const [fingerprintCount, ipCount] = await Promise.all([
      database.kufizimAntiSpamKandidati.count({
        where: {
          ...baseWhere,
          fingerprint_hash: fingerprintHash,
        },
      }),
      database.kufizimAntiSpamKandidati.count({
        where: {
          ...baseWhere,
          ip_hash: ipHash,
        },
      }),
    ]);

    if (fingerprintCount >= 3 || ipCount >= 3) {
      throw new HttpException(
        'Është arritur kufiri prej 3 propozimesh në 24 orë.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
