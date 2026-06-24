import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RoliUserit } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { KandidatEditorialResponse } from './dto/kandidat-editorial.response';
import { PerditesoKandidatDto } from './dto/perditeso-kandidat.dto';
import { KandidatetService } from './kandidatet.service';

@ApiTags('Admin - Përmbajtja e kandidatëve')
@ApiBearerAuth()
@Controller('admin/kandidatet')
@UseGuards(ClerkAuthGuard, RolesGuard)
@Roles(
  RoliUserit.gazetar,
  RoliUserit.super_gazetar,
  RoliUserit.moderator,
  RoliUserit.super_admin,
)
@ApiUnauthorizedResponse({
  description: 'Mungon ose është i pavlefshëm token-i.',
})
@ApiForbiddenResponse({ description: 'Roli i përdoruesit nuk lejohet.' })
export class KandidatetAdminController {
  constructor(private readonly kandidatetService: KandidatetService) {}

  @Put(':id')
  @ApiOperation({ summary: 'Përditëson tekstin ose fotografinë e kandidatit' })
  @ApiOkResponse({ type: KandidatEditorialResponse })
  @ApiBadRequestResponse({
    description: 'Body bosh, fusha të palejuara ose të dhëna të pavlefshme.',
  })
  @ApiNotFoundResponse({ description: 'Kandidati nuk ekziston.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PerditesoKandidatDto,
  ): Promise<KandidatEditorialResponse> {
    return this.kandidatetService.updateEditorialContent(id, dto);
  }
}
