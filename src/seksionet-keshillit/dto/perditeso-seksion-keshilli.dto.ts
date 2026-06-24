import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class PerditesoSeksionKeshilliDto {
  @ApiPropertyOptional({ example: 'Juristë Kushtetutarë' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  titulli?: string;

  @ApiPropertyOptional({
    example: 'Juristët kontrollojnë vlefshmërinë kushtetuese.',
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  pershkrimi?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/seksioni.jpg',
    nullable: true,
    description: 'Vendos null për të hequr imazhin.',
  })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(1000)
  url_imazhi?: string | null;
}
