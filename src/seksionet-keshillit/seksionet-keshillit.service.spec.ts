import { PrismaService } from '../prisma/prisma.service';
import { SeksionetKeshillitService } from './seksionet-keshillit.service';

describe('SeksionetKeshillitService', () => {
  const findMany = jest.fn();
  const updateMany = jest.fn();
  const findUnique = jest.fn();
  const prisma = {
    seksioniKeshillit: {
      findMany,
      updateMany,
      findUnique,
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

  it('përditëson vetëm përmbajtjen editoriale të seksionit', async () => {
    updateMany.mockResolvedValue({ count: 1 });
    findUnique.mockResolvedValue({
      id: 1,
      key: 'juriste_kushtetutare',
      titulli: 'Titulli i ri',
      pershkrimi: 'Përshkrimi i ri i seksionit.',
      numri_vendeve: 2,
      renditja: 1,
      url_imazhi: null,
      updated_at: new Date(),
    });

    await service.updateEditorialContent(1, {
      titulli: '  Titulli i ri  ',
      pershkrimi: '  Përshkrimi i ri i seksionit.  ',
      url_imazhi: null,
    });

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: 1,
        deleted_at: null,
      },
      data: {
        titulli: 'Titulli i ri',
        pershkrimi: 'Përshkrimi i ri i seksionit.',
        url_imazhi: null,
      },
    });
  });

  it('refuzon body bosh për përditësim', async () => {
    await expect(service.updateEditorialContent(1, {})).rejects.toThrow(
      'Duhet të dërgohet të paktën një fushë për përditësim.',
    );

    expect(updateMany).not.toHaveBeenCalled();
  });

  it('kthen 404 kur seksioni është fshirë ose nuk ekziston', async () => {
    updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.updateEditorialContent(999, { titulli: 'Titulli i ri' }),
    ).rejects.toThrow('Seksioni nuk ekziston.');

    expect(findUnique).not.toHaveBeenCalled();
  });
});
