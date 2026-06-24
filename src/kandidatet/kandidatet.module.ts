import { Module } from '@nestjs/common';
import { AntiSpamModule } from '../anti-spam/anti-spam.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { KandidatetAdminController } from './kandidatet-admin.controller';
import { KandidatetController } from './kandidatet.controller';
import { KandidatetService } from './kandidatet.service';

@Module({
  imports: [AntiSpamModule, AuthModule, UsersModule],
  controllers: [KandidatetController, KandidatetAdminController],
  providers: [KandidatetService],
  exports: [KandidatetService],
})
export class KandidatetModule {}
