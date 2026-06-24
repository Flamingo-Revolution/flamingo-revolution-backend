import { PrismaService } from '../prisma/prisma.service';
import { SeksionetKeshillitService } from './seksionet-keshillit.service';

describe('SeksionetKeshillitService', () => {
  const findMany = jest.fn();
  const prisma = {
    seksioniKeshillit: {
      findMany,
    },
  } as unknown as PrismaService;
  const service = new SeksionetKeshillitService(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('llogarit numrin dhe përqindjen e votave në seksion', async () => {
    findMany.mockResolvedValue([
      {
        id: 1,
        key: 'juriste_kushtetutare',
        titulli: 'Juristë Kushtetutarë',
        pershkrimi: 'Përshkrimi',
        numri_vendeve: 2,
        url_imazhi: null,
        kandidatet: [
          {
            id: 10,
            emri: 'Kandidati A',
            bio: 'Bio A',
            url_foto: null,
            _count: { votat: 1 },
          },
          {
            id: 11,
            emri: 'Kandidati B',
            bio: 'Bio B',
            url_foto: null,
            _count: { votat: 2 },
          },
        ],
      },
    ]);

    await expect(service.findPublicWithCandidates()).resolves.toEqual([
      {
        id: 1,
        key: 'juriste_kushtetutare',
        titulli: 'Juristë Kushtetutarë',
        pershkrimi: 'Përshkrimi',
        numri_vendeve: 2,
        url_imazhi: null,
        kandidatet: [
          {
            id: 10,
            emri: 'Kandidati A',
            bio: 'Bio A',
            url_foto: null,
            numri_votave: 1,
            perqindja_votave: 33.33,
          },
          {
            id: 11,
            emri: 'Kandidati B',
            bio: 'Bio B',
            url_foto: null,
            numri_votave: 2,
            perqindja_votave: 66.67,
          },
        ],
      },
    ]);
  });

  it('kthen zero për përqindjen kur seksioni nuk ka vota', async () => {
    findMany.mockResolvedValue([
      {
        id: 1,
        key: 'gazetare',
        titulli: 'Gazetarë',
        pershkrimi: 'Përshkrimi',
        numri_vendeve: 2,
        url_imazhi: null,
        kandidatet: [
          {
            id: 20,
            emri: 'Kandidati',
            bio: 'Bio',
            url_foto: null,
            _count: { votat: 0 },
          },
        ],
      },
    ]);

    const result = await service.findPublicWithCandidates();

    expect(result[0].kandidatet[0].perqindja_votave).toBe(0);
  });

  it('kërkon vetëm seksione dhe kandidatë publikë', async () => {
    findMany.mockResolvedValue([]);

    await service.findPublicWithCandidates();

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deleted_at: null },
        orderBy: { renditja: 'asc' },
      }),
    );
  });
});
