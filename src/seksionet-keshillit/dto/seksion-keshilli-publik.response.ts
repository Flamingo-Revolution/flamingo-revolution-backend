import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { KandidatPublikResponse } from './kandidat-publik.response';

export class SeksionKeshilliPublikResponse {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'juriste_kushtetutare' })
  key!: string;

  @ApiProperty({ example: 'Juristë Kushtetutarë' })
  titulli!: string;

  @ApiProperty({ example: 'Juristët kontrollojnë vlefshmërinë kushtetuese.' })
  pershkrimi!: string;

  @ApiProperty({ example: 2 })
  numri_vendeve!: number;

  @ApiPropertyOptional({ example: '/uploads/juriste.png', nullable: true })
  url_imazhi!: string | null;

  @ApiProperty({ type: [KandidatPublikResponse] })
  kandidatet!: KandidatPublikResponse[];
}
