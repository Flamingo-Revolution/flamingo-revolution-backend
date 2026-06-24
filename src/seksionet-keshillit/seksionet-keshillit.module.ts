import { Module } from '@nestjs/common';
import { SeksionetKeshillitController } from './seksionet-keshillit.controller';
import { SeksionetKeshillitService } from './seksionet-keshillit.service';

@Module({
  controllers: [SeksionetKeshillitController],
  providers: [SeksionetKeshillitService],
  exports: [SeksionetKeshillitService],
})
export class SeksionetKeshillitModule {}
