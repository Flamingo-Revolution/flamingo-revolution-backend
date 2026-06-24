import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SeksionKeshilliEditorialResponse {
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

  @ApiProperty({ example: 1 })
  renditja!: number;

  @ApiPropertyOptional({
    example: 'https://example.com/seksioni.jpg',
    nullable: true,
  })
  url_imazhi!: string | null;

  @ApiProperty()
  updated_at!: Date;
}
