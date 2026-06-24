import { Module } from '@nestjs/common';
import { VotatKandidateveController } from './votat-kandidateve.controller';
import { VotatKandidateveService } from './votat-kandidateve.service';

@Module({
  controllers: [VotatKandidateveController],
  providers: [VotatKandidateveService],
})
export class VotatKandidateveModule {}
