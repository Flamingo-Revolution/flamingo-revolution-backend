import { ApiProperty } from '@nestjs/swagger';

export class PropozimKandidatiResponse {
  @ApiProperty({ example: 'Kandidati u dërgua për shqyrtim.' })
  message!: string;

  @ApiProperty({ example: 15 })
  kandidat_id!: number;
}
