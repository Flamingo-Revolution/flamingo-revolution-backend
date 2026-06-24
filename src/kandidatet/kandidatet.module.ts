import { Module } from '@nestjs/common';
import { KandidatetController } from './kandidatet.controller';
import { KandidatetService } from './kandidatet.service';

@Module({
  controllers: [KandidatetController],
  providers: [KandidatetService],
  exports: [KandidatetService],
})
export class KandidatetModule {}
