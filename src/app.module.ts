import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AntiSpamModule } from './anti-spam/anti-spam.module';
import { AuthModule } from './auth/auth.module';
import { KandidatetModule } from './kandidatet/kandidatet.module';
import { ModerimetKandidateveModule } from './moderimet-kandidateve/moderimet-kandidateve.module';
import { PrismaModule } from './prisma/prisma.module';
import { SeksionetKeshillitModule } from './seksionet-keshillit/seksionet-keshillit.module';
import { UsersModule } from './users/users.module';
import { VotatKandidateveModule } from './votat-kandidateve/votat-kandidateve.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SeksionetKeshillitModule,
    KandidatetModule,
    VotatKandidateveModule,
    ModerimetKandidateveModule,
    AntiSpamModule,
  ],
})
export class AppModule {}
