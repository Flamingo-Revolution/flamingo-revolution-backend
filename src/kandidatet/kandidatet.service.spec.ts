import { BadRequestException, NotFoundException } from '@nestjs/common';
import { StatusiKandidatit } from '@prisma/client';
import { AntiSpamService } from '../anti-spam/anti-spam.service';
import { CaptchaService } from '../anti-spam/captcha.service';
import { PrismaService } from '../prisma/prisma.service';
import { KandidatetService } from './kandidatet.service';

describe('KandidatetService', () => {
  const findFirst = jest.fn();
  const createCandidate = jest.fn();
  const createAntiSpamEvent = jest.fn();
  const transaction = {
    seksioniKeshillit: {
      findFirst,
    },
    kandidat: {
      create: createCandidate,
    },
    kufizimAntiSpamKandidati: {
      create: createAntiSpamEvent,
    },
  };
  const runTransaction = jest.fn(
    async (callback: (database: typeof transaction) => Promise<unknown>) =>
      callback(transaction),
  );
  const prisma = {
    $transaction: runTransaction,
  } as unknown as PrismaService;
  const verifyTurnstile = jest.fn();
  const captcha = {
    verifyTurnstile,
  } as unknown as CaptchaService;
  const createHash = jest.fn((value: string) => `hash:${value}`);
  const ensureCandidateProposalAllowed = jest.fn();
  const antiSpam = {
    createHash,
    ensureCandidateProposalAllowed,
  } as unknown as AntiSpamService;
  const service = new KandidatetService(prisma, captcha, antiSpam);
  const dto = {
    seksion_id: 1,
    emri: 'Kandidati Test',
    bio: 'Një biografi e vlefshme për kandidatin.',
    url_foto: 'https://example.com/photo.jpg',
    captcha_token: 'captcha-token',
    website: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ruan kandidatin në shqyrtim dhe ngjarjen anti-spam', async () => {
    verifyTurnstile.mockResolvedValue(undefined);
    findFirst.mockResolvedValue({ id: 1 });
    ensureCandidateProposalAllowed.mockResolvedValue(undefined);
    createCandidate.mockResolvedValue({ id: 15 });
    createAntiSpamEvent.mockResolvedValue({ id: 30 });

    await expect(
      service.propose(dto, 'device-value', '127.0.0.1'),
    ).resolves.toEqual({
      message: 'Kandidati u dërgua për shqyrtim.',
      kandidat_id: 15,
    });

    expect(createCandidate).toHaveBeenCalledWith({
      data: {
        seksion_id: 1,
        emri: 'Kandidati Test',
        bio: 'Një biografi e vlefshme për kandidatin.',
        url_foto: 'https://example.com/photo.jpg',
        statusi: StatusiKandidatit.ne_shqyrtim,
      },
      select: {
        id: true,
      },
    });
    expect(createAntiSpamEvent).toHaveBeenCalledTimes(1);
  });

  it('refuzon honeypot-in pa thirrur CAPTCHA-n', async () => {
    await expect(
      service.propose({ ...dto, website: 'bot' }, 'device', '127.0.0.1'),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(verifyTurnstile).not.toHaveBeenCalled();
  });

  it('refuzon seksionin që nuk ekziston', async () => {
    verifyTurnstile.mockResolvedValue(undefined);
    findFirst.mockResolvedValue(null);

    await expect(
      service.propose(dto, 'device', '127.0.0.1'),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(createCandidate).not.toHaveBeenCalled();
  });
});
