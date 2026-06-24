import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusiKandidatit } from '@prisma/client';

export class SeksionKandidatiAdminResponse {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'juriste_kushtetutare' })
  key!: string;

  @ApiProperty({ example: 'Juristë Kushtetutarë' })
  titulli!: string;
}

export class KandidatAdminResponse {
  @ApiProperty({ example: 15 })
  id!: number;

  @ApiProperty({ example: 'Emri i kandidatit' })
  emri!: string;

  @ApiProperty({ example: 'Përshkrimi dhe përvoja e kandidatit.' })
  bio!: string;

  @ApiPropertyOptional({ example: 'https://example.com/photo.jpg' })
  url_foto!: string | null;

  @ApiProperty({ enum: StatusiKandidatit })
  statusi!: StatusiKandidatit;

  @ApiProperty()
  created_at!: Date;

  @ApiProperty({ type: SeksionKandidatiAdminResponse })
  seksioni!: SeksionKandidatiAdminResponse;
}
