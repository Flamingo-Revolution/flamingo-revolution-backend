import { Module } from '@nestjs/common';
import { AntiSpamService } from './anti-spam.service';
import { CaptchaService } from './captcha.service';

@Module({
  providers: [AntiSpamService, CaptchaService],
  exports: [AntiSpamService, CaptchaService],
})
export class AntiSpamModule {}
