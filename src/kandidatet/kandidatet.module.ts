import { Module } from '@nestjs/common';
import { AntiSpamModule } from '../anti-spam/anti-spam.module';
import { KandidatetController } from './kandidatet.controller';
import { KandidatetService } from './kandidatet.service';

@Module({
  imports: [AntiSpamModule],
  controllers: [KandidatetController],
  providers: [KandidatetService],
  exports: [KandidatetService],
})
export class KandidatetModule {}
