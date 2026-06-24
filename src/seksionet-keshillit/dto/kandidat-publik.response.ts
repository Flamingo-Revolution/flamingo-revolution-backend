import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class KandidatPublikResponse {
  @ApiProperty({ example: 10 })
  id!: number;

  @ApiProperty({ example: 'Emri i kandidatit' })
  emri!: string;

  @ApiProperty({ example: 'Përshkrimi i kandidatit.' })
  bio!: string;

  @ApiPropertyOptional({ example: '/uploads/kandidati.png', nullable: true })
  url_foto!: string | null;

  @ApiProperty({ example: 120 })
  numri_votave!: number;

  @ApiProperty({ example: 40, description: 'Përqindja e votave në seksion.' })
  perqindja_votave!: number;
}
