import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findActiveByClerkUserId(clerkUserId: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        clerk_user_id: clerkUserId,
        statusi: 'aktiv',
        deleted_at: null,
      },
    });
  }
}
