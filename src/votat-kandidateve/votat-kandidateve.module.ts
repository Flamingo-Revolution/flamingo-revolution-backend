import { Module } from '@nestjs/common';
import { AntiSpamModule } from '../anti-spam/anti-spam.module';
import { VotatKandidateveController } from './votat-kandidateve.controller';
import { VotatKandidateveService } from './votat-kandidateve.service';

@Module({
  imports: [AntiSpamModule],
  controllers: [VotatKandidateveController],
  providers: [VotatKandidateveService],
})
export class VotatKandidateveModule {}
