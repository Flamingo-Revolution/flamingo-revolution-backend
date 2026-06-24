import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class PropozoKandidatDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  seksion_id!: number;

  @ApiProperty({ example: 'Emri i kandidatit' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  emri!: string;

  @ApiProperty({ example: 'Përshkrimi dhe përvoja e kandidatit.' })
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  bio!: string;

  @ApiPropertyOptional({ example: 'https://example.com/kandidati.jpg' })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(1000)
  url_foto?: string;

  @ApiProperty({ description: 'Token-i i krijuar nga Cloudflare Turnstile.' })
  @IsString()
  @MinLength(1)
  @MaxLength(2048)
  captcha_token!: string;

  @ApiPropertyOptional({
    description: 'Fushë honeypot. Frontend-i duhet ta lërë bosh.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;
}
