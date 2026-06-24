import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  LlojiVeprimitAntiSpam,
  Prisma,
  StatusiKandidatit,
} from '@prisma/client';
import { AntiSpamService } from '../anti-spam/anti-spam.service';
import { CaptchaService } from '../anti-spam/captcha.service';
import { PrismaService } from '../prisma/prisma.service';
import { MbeshtetKandidatDto } from './dto/mbeshtet-kandidat.dto';
import { RezultatVotimiResponse } from './dto/rezultat-votimi.response';

@Injectable()
export class VotatKandidateveService {
  private readonly publicStatuses = [
    StatusiKandidatit.i_aprovuar,
    StatusiKandidatit.i_zgjedhur,
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly captchaService: CaptchaService,
    private readonly antiSpamService: AntiSpamService,
  ) {}

  async support(
    kandidatId: number,
    dto: MbeshtetKandidatDto,
    fingerprint: string,
    ip: string,
  ): Promise<RezultatVotimiResponse> {
    await this.ensureCandidateIsPublic(kandidatId);
    await this.captchaService.verifyTurnstile(dto.captcha_token, ip);

    const fingerprintHash = this.antiSpamService.createHash(fingerprint);
    const ipHash = this.antiSpamService.createHash(ip);

    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const kandidati = await transaction.kandidat.findFirst({
            where: {
              id: kandidatId,
              deleted_at: null,
              statusi: {
                in: this.publicStatuses,
              },
            },
            select: {
              id: true,
              seksion_id: true,
            },
          });

          if (!kandidati) {
            throw new NotFoundException(
              'Kandidati nuk ekziston ose nuk është publik.',
            );
          }

          const existingVote = await transaction.voteKandidati.findFirst({
            where: {
              kandidat_id: kandidatId,
              fingerprint_hash: fingerprintHash,
              ip_hash: ipHash,
            },
            select: {
              id: true,
            },
          });

          if (existingVote) {
            throw new ConflictException(
              'Kjo pajisje e ka mbështetur tashmë kandidatin.',
            );
          }

          await this.antiSpamService.ensureCandidateVoteAllowed(
            transaction,
            fingerprintHash,
            ipHash,
          );

          await transaction.voteKandidati.create({
            data: {
              kandidat_id: kandidatId,
              fingerprint_hash: fingerprintHash,
              ip_hash: ipHash,
            },
          });

          await transaction.kufizimAntiSpamKandidati.create({
            data: {
              lloji_veprimit: LlojiVeprimitAntiSpam.votim_kandidati,
              fingerprint_hash: fingerprintHash,
              ip_hash: ipHash,
            },
          });

          const [numriVotave, votatTotale] = await Promise.all([
            transaction.voteKandidati.count({
              where: {
                kandidat_id: kandidatId,
              },
            }),
            transaction.voteKandidati.count({
              where: {
                kandidati: {
                  seksion_id: kandidati.seksion_id,
                  deleted_at: null,
                  statusi: {
                    in: this.publicStatuses,
                  },
                },
              },
            }),
          ]);

          return {
            message: 'Mbështetja u regjistrua.',
            kandidat_id: kandidatId,
            numri_votave: numriVotave,
            perqindja_votave: this.calculatePercentage(
              numriVotave,
              votatTotale,
            ),
          };
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Kjo pajisje e ka mbështetur tashmë kandidatin.',
        );
      }

      throw error;
    }
  }

  private async ensureCandidateIsPublic(kandidatId: number): Promise<void> {
    const kandidati = await this.prisma.kandidat.findFirst({
      where: {
        id: kandidatId,
        deleted_at: null,
        statusi: {
          in: this.publicStatuses,
        },
      },
      select: {
        id: true,
      },
    });

    if (!kandidati) {
      throw new NotFoundException(
        'Kandidati nuk ekziston ose nuk është publik.',
      );
    }
  }

  private calculatePercentage(votat: number, votatTotale: number): number {
    if (votatTotale === 0) {
      return 0;
    }

    return Number(((votat / votatTotale) * 100).toFixed(2));
  }
}
