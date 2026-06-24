import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class RefuzoKandidatDto {
  @ApiProperty({
    example: 'Nuk ka informacion të mjaftueshëm për kandidatin.',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  arsyeja!: string;
}
