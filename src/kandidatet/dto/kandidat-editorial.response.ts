import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusiKandidatit } from '@prisma/client';

export class KandidatEditorialResponse {
  @ApiProperty({ example: 15 })
  id!: number;

  @ApiProperty({ example: 'Emri i kandidatit' })
  emri!: string;

  @ApiProperty({ example: 'Biografia e kandidatit.' })
  bio!: string;

  @ApiPropertyOptional({
    example: 'https://example.com/kandidati.jpg',
    nullable: true,
  })
  url_foto!: string | null;

  @ApiProperty({ enum: StatusiKandidatit })
  statusi!: StatusiKandidatit;

  @ApiProperty()
  updated_at!: Date;
}
