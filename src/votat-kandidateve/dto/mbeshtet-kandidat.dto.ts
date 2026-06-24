import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class MbeshtetKandidatDto {
  @ApiProperty({ description: 'Token-i i krijuar nga Cloudflare Turnstile.' })
  @IsString()
  @MinLength(1)
  @MaxLength(2048)
  captcha_token!: string;
}
