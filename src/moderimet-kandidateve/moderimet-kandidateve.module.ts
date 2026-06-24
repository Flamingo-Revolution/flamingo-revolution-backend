import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ModerimetKandidateveController } from './moderimet-kandidateve.controller';
import { ModerimetKandidateveService } from './moderimet-kandidateve.service';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [ModerimetKandidateveController],
  providers: [ModerimetKandidateveService],
})
export class ModerimetKandidateveModule {}
