import { ConflictException, NotFoundException } from '@nestjs/common';
import { StatusiKandidatit, VeprimiModerimit } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ModerimetKandidateveService } from './moderimet-kandidateve.service';

describe('ModerimetKandidateveService', () => {
  const findMany = jest.fn();
  const updateMany = jest.fn();
  const findUnique = jest.fn();
  const createModerim = jest.fn();
  const transaction = {
    kandidat: {
      updateMany,
      findUnique,
    },
    moderimKandidati: {
      create: createModerim,
    },
  };
  const runTransaction = jest.fn(
    async (callback: (database: typeof transaction) => Promise<unknown>) =>
      callback(transaction),
  );
  const prisma = {
    kandidat: {
      findMany,
    },
    $transaction: runTransaction,
  } as unknown as PrismaService;
  const service = new ModerimetKandidateveService(prisma);
  const kandidat = {
    id: 15,
    emri: 'Kandidati Test',
    bio: 'Bio e kandidatit.',
    url_foto: null,
    statusi: StatusiKandidatit.i_aprovuar,
    created_at: new Date(),
    seksioni: {
      id: 1,
      key: 'juriste_kushtetutare',
      titulli: 'Juristë Kushtetutarë',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('liston vetëm kandidatët në shqyrtim', async () => {
    findMany.mockResolvedValue([]);

    await service.findPending();

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          statusi: StatusiKandidatit.ne_shqyrtim,
          deleted_at: null,
        },
        orderBy: {
          created_at: 'asc',
        },
      }),
    );
  });

  it('aprovon kandidatin dhe ruan moderimin në transaksion', async () => {
    updateMany.mockResolvedValue({ count: 1 });
    createModerim.mockResolvedValue({ id: 20 });
    findUnique.mockResolvedValue(kandidat);

    await expect(service.approve(15, 1)).resolves.toEqual(kandidat);

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: 15,
        statusi: StatusiKandidatit.ne_shqyrtim,
        deleted_at: null,
      },
      data: {
        statusi: StatusiKandidatit.i_aprovuar,
      },
    });
    expect(createModerim).toHaveBeenCalledWith({
      data: {
        kandidat_id: 15,
        moderator_id: 1,
        veprimi: VeprimiModerimit.aprovim,
        arsyeja: null,
      },
    });
  });

  it('refuzon kandidatin dhe pastron hapësirat e arsyes', async () => {
    updateMany.mockResolvedValue({ count: 1 });
    createModerim.mockResolvedValue({ id: 21 });
    findUnique.mockResolvedValue({
      ...kandidat,
      statusi: StatusiKandidatit.i_refuzuar,
    });

    await service.reject(15, 1, '  Arsyeja e refuzimit.  ');

    expect(createModerim).toHaveBeenCalledWith({
      data: {
        kandidat_id: 15,
        moderator_id: 1,
        veprimi: VeprimiModerimit.refuzim,
        arsyeja: 'Arsyeja e refuzimit.',
      },
    });
  });

  it('refuzon ndryshimin kur kandidati nuk është më në shqyrtim', async () => {
    updateMany.mockResolvedValue({ count: 0 });
    findUnique.mockResolvedValue({
      statusi: StatusiKandidatit.i_aprovuar,
      deleted_at: null,
    });

    await expect(service.approve(15, 1)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(createModerim).not.toHaveBeenCalled();
  });

  it('kthen 404 kur kandidati nuk ekziston', async () => {
    updateMany.mockResolvedValue({ count: 0 });
    findUnique.mockResolvedValue(null);

    await expect(service.approve(999, 1)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
