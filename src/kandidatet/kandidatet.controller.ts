import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { PropozoKandidatDto } from './dto/propozo-kandidat.dto';
import { PropozimKandidatiResponse } from './dto/propozim-kandidati.response';
import { KandidatetService } from './kandidatet.service';

@ApiTags('Publike - Kandidatët')
@Controller('publike/kandidatet')
export class KandidatetController {
  constructor(private readonly kandidatetService: KandidatetService) {}

  @Post()
  @ApiOperation({ summary: 'Propozon një kandidat anonim për shqyrtim' })
  @ApiHeader({
    name: 'x-device-fingerprint',
    required: true,
    description:
      'Vlerë fingerprint nga frontend-i. Backend-i ruan vetëm hash-in.',
  })
  @ApiCreatedResponse({ type: PropozimKandidatiResponse })
  @ApiBadRequestResponse({
    description: 'Të dhëna, honeypot ose CAPTCHA e pavlefshme.',
  })
  @ApiTooManyRequestsResponse({
    description: 'Janë kryer 3 propozime në 24 orët e fundit.',
  })
  propose(
    @Body() dto: PropozoKandidatDto,
    @Headers('x-device-fingerprint') fingerprint: string | undefined,
    @Req() request: Request,
  ): Promise<PropozimKandidatiResponse> {
    if (!fingerprint?.trim()) {
      throw new BadRequestException('Mungon fingerprint-i i pajisjes.');
    }

    const ip = request.ip || request.socket.remoteAddress;

    if (!ip) {
      throw new BadRequestException('Adresa e kërkesës nuk mund të lexohet.');
    }

    return this.kandidatetService.propose(dto, fingerprint.trim(), ip);
  }
}
