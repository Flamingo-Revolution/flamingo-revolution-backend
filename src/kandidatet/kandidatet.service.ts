import {
  BadRequestException,
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
import { PropozoKandidatDto } from './dto/propozo-kandidat.dto';
import { PropozimKandidatiResponse } from './dto/propozim-kandidati.response';

@Injectable()
export class KandidatetService {
  private readonly blockedWords = new Set(['fuck', 'shit']);

  constructor(
    private readonly prisma: PrismaService,
    private readonly captchaService: CaptchaService,
    private readonly antiSpamService: AntiSpamService,
  ) {}

  async propose(
    dto: PropozoKandidatDto,
    fingerprint: string,
    ip: string,
  ): Promise<PropozimKandidatiResponse> {
    if (dto.website?.trim()) {
      throw new BadRequestException('Kërkesa nuk mund të pranohet.');
    }

    this.ensureContentIsAllowed(dto.emri, dto.bio);
    await this.captchaService.verifyTurnstile(dto.captcha_token, ip);

    const fingerprintHash = this.antiSpamService.createHash(fingerprint);
    const ipHash = this.antiSpamService.createHash(ip);

    return this.prisma.$transaction(
      async (transaction) => {
        const seksioni = await transaction.seksioniKeshillit.findFirst({
          where: {
            id: dto.seksion_id,
            deleted_at: null,
          },
          select: {
            id: true,
          },
        });

        if (!seksioni) {
          throw new NotFoundException('Seksioni i këshillit nuk ekziston.');
        }

        await this.antiSpamService.ensureCandidateProposalAllowed(
          transaction,
          fingerprintHash,
          ipHash,
        );

        const kandidati = await transaction.kandidat.create({
          data: {
            seksion_id: dto.seksion_id,
            emri: dto.emri.trim(),
            bio: dto.bio.trim(),
            url_foto: dto.url_foto?.trim() || null,
            statusi: StatusiKandidatit.ne_shqyrtim,
          },
          select: {
            id: true,
          },
        });

        await transaction.kufizimAntiSpamKandidati.create({
          data: {
            lloji_veprimit: LlojiVeprimitAntiSpam.propozim_kandidati,
            fingerprint_hash: fingerprintHash,
            ip_hash: ipHash,
          },
        });

        return {
          message: 'Kandidati u dërgua për shqyrtim.',
          kandidat_id: kandidati.id,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  private ensureContentIsAllowed(emri: string, bio: string): void {
    const words = `${emri} ${bio}`
      .toLocaleLowerCase('sq')
      .normalize('NFKD')
      .replace(/\p{Diacritic}/gu, '')
      .match(/\p{Letter}+/gu);

    if (words?.some((word) => this.blockedWords.has(word))) {
      throw new BadRequestException(
        'Përmbajtja përmban fjalë të papërshtatshme.',
      );
    }
  }
}
