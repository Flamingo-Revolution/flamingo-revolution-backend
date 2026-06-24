import { HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { AntiSpamService } from './anti-spam.service';

describe('AntiSpamService', () => {
  const config = {
    get: jest.fn(() => 'secret-test'),
  } as unknown as ConfigService;
  const service = new AntiSpamService(config);

  it('krijon hash të qëndrueshëm pa kthyer vlerën origjinale', () => {
    const first = service.createHash('device-123');
    const second = service.createHash('device-123');

    expect(first).toBe(second);
    expect(first).not.toContain('device-123');
    expect(first).toHaveLength(64);
  });

  it('refuzon propozimin e katërt brenda 24 orëve', async () => {
    const database = {
      kufizimAntiSpamKandidati: {
        count: jest.fn().mockResolvedValueOnce(3).mockResolvedValueOnce(0),
      },
    } as unknown as PrismaClient;

    await expect(
      service.ensureCandidateProposalAllowed(
        database,
        'fingerprint-hash',
        'ip-hash',
      ),
    ).rejects.toBeInstanceOf(HttpException);
  });

  it('refuzon votën e njëzetenjëtë brenda një ore', async () => {
    const database = {
      kufizimAntiSpamKandidati: {
        count: jest.fn().mockResolvedValueOnce(0).mockResolvedValueOnce(20),
      },
    } as unknown as PrismaClient;

    await expect(
      service.ensureCandidateVoteAllowed(
        database,
        'fingerprint-hash',
        'ip-hash',
      ),
    ).rejects.toBeInstanceOf(HttpException);
  });
});
