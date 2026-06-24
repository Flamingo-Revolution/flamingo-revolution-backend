import { User } from '@prisma/client';
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  clerkUserId: string;
  staffUser: User;
}
