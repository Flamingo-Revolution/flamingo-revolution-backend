import { ApiProperty } from '@nestjs/swagger';

export class RezultatVotimiResponse {
  @ApiProperty({ example: 'Mbështetja u regjistrua.' })
  message!: string;

  @ApiProperty({ example: 15 })
  kandidat_id!: number;

  @ApiProperty({ example: 120 })
  numri_votave!: number;

  @ApiProperty({ example: 40 })
  perqindja_votave!: number;
}
