import { CanActivate, Injectable } from '@nestjs/common';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  canActivate(): boolean {
    // TODO: Verifiko JWT-në e Clerk dhe bashkëngjit përdoruesin e stafit.
    return true;
  }
}
