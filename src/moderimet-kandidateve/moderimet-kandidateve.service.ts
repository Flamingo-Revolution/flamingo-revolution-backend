import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, StatusiKandidatit, VeprimiModerimit } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { KandidatAdminResponse } from './dto/kandidat-admin.response';

@Injectable()
export class ModerimetKandidateveService {
  constructor(private readonly prisma: PrismaService) {}

  findPending(): Promise<KandidatAdminResponse[]> {
    return this.prisma.kandidat.findMany({
      where: {
        statusi: StatusiKandidatit.ne_shqyrtim,
        deleted_at: null,
      },
      orderBy: {
        created_at: 'asc',
      },
      select: this.candidateSelect,
    });
  }

  approve(id: number, moderatorId: number): Promise<KandidatAdminResponse> {
    return this.changeStatus(
      id,
      moderatorId,
      StatusiKandidatit.i_aprovuar,
      VeprimiModerimit.aprovim,
      null,
    );
  }

  reject(
    id: number,
    moderatorId: number,
    arsyeja: string,
  ): Promise<KandidatAdminResponse> {
    return this.changeStatus(
      id,
      moderatorId,
      StatusiKandidatit.i_refuzuar,
      VeprimiModerimit.refuzim,
      arsyeja.trim(),
    );
  }

  private changeStatus(
    id: number,
    moderatorId: number,
    statusi: StatusiKandidatit,
    veprimi: VeprimiModerimit,
    arsyeja: string | null,
  ): Promise<KandidatAdminResponse> {
    return this.prisma.$transaction(
      async (transaction) => {
        const updateResult = await transaction.kandidat.updateMany({
          where: {
            id,
            statusi: StatusiKandidatit.ne_shqyrtim,
            deleted_at: null,
          },
          data: {
            statusi,
          },
        });

        if (updateResult.count === 0) {
          const kandidati = await transaction.kandidat.findUnique({
            where: { id },
            select: {
              statusi: true,
              deleted_at: true,
            },
          });

          if (!kandidati || kandidati.deleted_at) {
            throw new NotFoundException('Kandidati nuk ekziston.');
          }

          throw new ConflictException(
            'Kandidati nuk është më në statusin ne_shqyrtim.',
          );
        }

        await transaction.moderimKandidati.create({
          data: {
            kandidat_id: id,
            moderator_id: moderatorId,
            veprimi,
            arsyeja,
          },
        });

        const kandidati = await transaction.kandidat.findUnique({
          where: { id },
          select: this.candidateSelect,
        });

        if (!kandidati) {
          throw new NotFoundException('Kandidati nuk ekziston.');
        }

        return kandidati;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  private readonly candidateSelect = {
    id: true,
    emri: true,
    bio: true,
    url_foto: true,
    statusi: true,
    created_at: true,
    seksioni: {
      select: {
        id: true,
        key: true,
        titulli: true,
      },
    },
  } satisfies Prisma.KandidatSelect;
}
