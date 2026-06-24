import { ConflictException, NotFoundException } from '@nestjs/common';
import { StatusiKandidatit } from '@prisma/client';
import { AntiSpamService } from '../anti-spam/anti-spam.service';
import { CaptchaService } from '../anti-spam/captcha.service';
import { PrismaService } from '../prisma/prisma.service';
import { VotatKandidateveService } from './votat-kandidateve.service';

describe('VotatKandidateveService', () => {
  const preflightFindFirst = jest.fn();
  const transactionFindFirst = jest.fn();
  const findExistingVote = jest.fn();
  const createVote = jest.fn();
  const createAntiSpamEvent = jest.fn();
  const countVotes = jest.fn();
  const transaction = {
    kandidat: {
      findFirst: transactionFindFirst,
    },
    voteKandidati: {
      findFirst: findExistingVote,
      create: createVote,
      count: countVotes,
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
    kandidat: {
      findFirst: preflightFindFirst,
    },
    $transaction: runTransaction,
  } as unknown as PrismaService;
  const verifyTurnstile = jest.fn();
  const captcha = {
    verifyTurnstile,
  } as unknown as CaptchaService;
  const createHash = jest.fn((value: string) => `hash:${value}`);
  const ensureCandidateVoteAllowed = jest.fn();
  const antiSpam = {
    createHash,
    ensureCandidateVoteAllowed,
  } as unknown as AntiSpamService;
  const service = new VotatKandidateveService(prisma, captcha, antiSpam);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('regjistron votën dhe llogarit përqindjen në seksion', async () => {
    preflightFindFirst.mockResolvedValue({ id: 15 });
    verifyTurnstile.mockResolvedValue(undefined);
    transactionFindFirst.mockResolvedValue({ id: 15, seksion_id: 1 });
    findExistingVote.mockResolvedValue(null);
    ensureCandidateVoteAllowed.mockResolvedValue(undefined);
    createVote.mockResolvedValue({ id: 20 });
    createAntiSpamEvent.mockResolvedValue({ id: 30 });
    countVotes.mockResolvedValueOnce(2).mockResolvedValueOnce(5);

    await expect(
      service.support(
        15,
        { captcha_token: 'captcha-token' },
        'device',
        '127.0.0.1',
      ),
    ).resolves.toEqual({
      message: 'Mbështetja u regjistrua.',
      kandidat_id: 15,
      numri_votave: 2,
      perqindja_votave: 40,
    });

    expect(createVote).toHaveBeenCalledWith({
      data: {
        kandidat_id: 15,
        fingerprint_hash: 'hash:device',
        ip_hash: 'hash:127.0.0.1',
      },
    });
    expect(createAntiSpamEvent).toHaveBeenCalledTimes(1);
  });

  it('refuzon një votë të dyfishtë', async () => {
    preflightFindFirst.mockResolvedValue({ id: 15 });
    verifyTurnstile.mockResolvedValue(undefined);
    transactionFindFirst.mockResolvedValue({ id: 15, seksion_id: 1 });
    findExistingVote.mockResolvedValue({ id: 20 });

    await expect(
      service.support(
        15,
        { captcha_token: 'captcha-token' },
        'device',
        '127.0.0.1',
      ),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(createVote).not.toHaveBeenCalled();
  });

  it('refuzon kandidatin që nuk është publik para CAPTCHA-s', async () => {
    preflightFindFirst.mockResolvedValue(null);

    await expect(
      service.support(
        15,
        { captcha_token: 'captcha-token' },
        'device',
        '127.0.0.1',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(verifyTurnstile).not.toHaveBeenCalled();
  });

  it('numëron vetëm votat e kandidatëve publikë në të njëjtin seksion', async () => {
    preflightFindFirst.mockResolvedValue({ id: 15 });
    verifyTurnstile.mockResolvedValue(undefined);
    transactionFindFirst.mockResolvedValue({ id: 15, seksion_id: 4 });
    findExistingVote.mockResolvedValue(null);
    ensureCandidateVoteAllowed.mockResolvedValue(undefined);
    createVote.mockResolvedValue({ id: 20 });
    createAntiSpamEvent.mockResolvedValue({ id: 30 });
    countVotes.mockResolvedValueOnce(1).mockResolvedValueOnce(1);

    await service.support(
      15,
      { captcha_token: 'captcha-token' },
      'device',
      '127.0.0.1',
    );

    expect(countVotes).toHaveBeenLastCalledWith({
      where: {
        kandidati: {
          seksion_id: 4,
          deleted_at: null,
          statusi: {
            in: [StatusiKandidatit.i_aprovuar, StatusiKandidatit.i_zgjedhur],
          },
        },
      },
    });
  });
});
