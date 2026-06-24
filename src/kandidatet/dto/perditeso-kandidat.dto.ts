import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class PerditesoKandidatDto {
  @ApiPropertyOptional({ example: 'Emri i përditësuar' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  emri?: string;

  @ApiPropertyOptional({ example: 'Biografia e përditësuar e kandidatit.' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  bio?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/kandidati.jpg',
    nullable: true,
    description: 'Vendos null për të hequr fotografinë.',
  })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(1000)
  url_foto?: string | null;
}
