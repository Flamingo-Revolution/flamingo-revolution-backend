import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Param,
  ParseIntPipe,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { MbeshtetKandidatDto } from './dto/mbeshtet-kandidat.dto';
import { RezultatVotimiResponse } from './dto/rezultat-votimi.response';
import { VotatKandidateveService } from './votat-kandidateve.service';

@ApiTags('Publike - Votat e kandidatëve')
@Controller('publike/kandidatet')
export class VotatKandidateveController {
  constructor(
    private readonly votatKandidateveService: VotatKandidateveService,
  ) {}

  @Post(':id/mbeshtet')
  @ApiOperation({ summary: 'Regjistron mbështetjen anonime për një kandidat' })
  @ApiHeader({
    name: 'x-device-fingerprint',
    required: true,
    description:
      'Vlerë fingerprint nga frontend-i. Backend-i ruan vetëm hash-in.',
  })
  @ApiCreatedResponse({ type: RezultatVotimiResponse })
  @ApiBadRequestResponse({
    description: 'Fingerprint ose CAPTCHA e pavlefshme.',
  })
  @ApiNotFoundResponse({
    description: 'Kandidati nuk ekziston ose nuk është publik.',
  })
  @ApiConflictResponse({
    description: 'Pajisja e ka mbështetur tashmë kandidatin.',
  })
  @ApiTooManyRequestsResponse({
    description: 'Janë kryer 20 vota në një orë.',
  })
  support(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MbeshtetKandidatDto,
    @Headers('x-device-fingerprint') fingerprint: string | undefined,
    @Req() request: Request,
  ): Promise<RezultatVotimiResponse> {
    if (!fingerprint?.trim()) {
      throw new BadRequestException('Mungon fingerprint-i i pajisjes.');
    }

    const ip = request.ip || request.socket.remoteAddress;

    if (!ip) {
      throw new BadRequestException('Adresa e kërkesës nuk mund të lexohet.');
    }

    return this.votatKandidateveService.support(
      id,
      dto,
      fingerprint.trim(),
      ip,
    );
  }
}
