import { Module } from '@nestjs/common';
import { ModerimetKandidateveController } from './moderimet-kandidateve.controller';
import { ModerimetKandidateveService } from './moderimet-kandidateve.service';

@Module({
  controllers: [ModerimetKandidateveController],
  providers: [ModerimetKandidateveService],
})
export class ModerimetKandidateveModule {}
