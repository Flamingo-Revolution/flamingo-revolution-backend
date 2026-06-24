import { CanActivate, Injectable } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(): boolean {
    // TODO: Kontrollo rolet e endpoint-it kundrejt përdoruesit lokal.
    return true;
  }
}
