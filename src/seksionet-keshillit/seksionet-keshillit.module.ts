import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { SeksionetKeshillitAdminController } from './seksionet-keshillit-admin.controller';
import { SeksionetKeshillitController } from './seksionet-keshillit.controller';
import { SeksionetKeshillitService } from './seksionet-keshillit.service';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [
    SeksionetKeshillitController,
    SeksionetKeshillitAdminController,
  ],
  providers: [SeksionetKeshillitService],
  exports: [SeksionetKeshillitService],
})
export class SeksionetKeshillitModule {}
