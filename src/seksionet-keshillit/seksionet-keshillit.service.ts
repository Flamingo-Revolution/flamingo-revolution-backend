import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StatusiKandidatit } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PerditesoSeksionKeshilliDto } from './dto/perditeso-seksion-keshilli.dto';
import { SeksionKeshilliEditorialResponse } from './dto/seksion-keshilli-editorial.response';
import { SeksionKeshilliPublikResponse } from './dto/seksion-keshilli-publik.response';

@Injectable()
export class SeksionetKeshillitService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublicWithCandidates(): Promise<SeksionKeshilliPublikResponse[]> {
    const seksionet = await this.prisma.seksioniKeshillit.findMany({
      where: {
        deleted_at: null,
      },
      orderBy: {
        renditja: 'asc',
      },
      select: {
        id: true,
        key: true,
        titulli: true,
        pershkrimi: true,
        numri_vendeve: true,
        url_imazhi: true,
        kandidatet: {
          where: {
            deleted_at: null,
            statusi: {
              in: [StatusiKandidatit.i_aprovuar, StatusiKandidatit.i_zgjedhur],
            },
          },
          orderBy: {
            created_at: 'asc',
          },
          select: {
            id: true,
            emri: true,
            bio: true,
            url_foto: true,
            _count: {
              select: {
                votat: true,
              },
            },
          },
        },
      },
    });

    return seksionet.map((seksioni) => {
      const votatTotale = seksioni.kandidatet.reduce(
        (total, kandidati) => total + kandidati._count.votat,
        0,
      );

      return {
        id: seksioni.id,
        key: seksioni.key,
        titulli: seksioni.titulli,
        pershkrimi: seksioni.pershkrimi,
        numri_vendeve: seksioni.numri_vendeve,
        url_imazhi: seksioni.url_imazhi,
        kandidatet: seksioni.kandidatet.map((kandidati) => {
          const numriVotave = kandidati._count.votat;

          return {
            id: kandidati.id,
            emri: kandidati.emri,
            bio: kandidati.bio,
            url_foto: kandidati.url_foto,
            numri_votave: numriVotave,
            perqindja_votave: this.calculatePercentage(
              numriVotave,
              votatTotale,
            ),
          };
        }),
      };
    });
  }

  async updateEditorialContent(
    id: number,
    dto: PerditesoSeksionKeshilliDto,
  ): Promise<SeksionKeshilliEditorialResponse> {
    if (
      dto.titulli === undefined &&
      dto.pershkrimi === undefined &&
      dto.url_imazhi === undefined
    ) {
      throw new BadRequestException(
        'Duhet të dërgohet të paktën një fushë për përditësim.',
      );
    }

    const updateResult = await this.prisma.seksioniKeshillit.updateMany({
      where: {
        id,
        deleted_at: null,
      },
      data: {
        ...(dto.titulli !== undefined && { titulli: dto.titulli.trim() }),
        ...(dto.pershkrimi !== undefined && {
          pershkrimi: dto.pershkrimi.trim(),
        }),
        ...(dto.url_imazhi !== undefined && {
          url_imazhi: dto.url_imazhi?.trim() || null,
        }),
      },
    });

    if (updateResult.count === 0) {
      throw new NotFoundException('Seksioni nuk ekziston.');
    }

    const seksioni = await this.prisma.seksioniKeshillit.findUnique({
      where: { id },
      select: {
        id: true,
        key: true,
        titulli: true,
        pershkrimi: true,
        numri_vendeve: true,
        renditja: true,
        url_imazhi: true,
        updated_at: true,
      },
    });

    if (!seksioni) {
      throw new NotFoundException('Seksioni nuk ekziston.');
    }

    return seksioni;
  }

  private calculatePercentage(votat: number, votatTotale: number): number {
    if (votatTotale === 0) {
      return 0;
    }

    return Number(((votat / votatTotale) * 100).toFixed(2));
  }
}
