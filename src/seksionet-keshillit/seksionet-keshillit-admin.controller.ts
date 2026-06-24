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
import { PerditesoSeksionKeshilliDto } from './dto/perditeso-seksion-keshilli.dto';
import { SeksionKeshilliEditorialResponse } from './dto/seksion-keshilli-editorial.response';
import { SeksionetKeshillitService } from './seksionet-keshillit.service';

@ApiTags('Admin - Përmbajtja e seksioneve')
@ApiBearerAuth()
@Controller('admin/seksionet-keshillit')
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
export class SeksionetKeshillitAdminController {
  constructor(
    private readonly seksionetKeshillitService: SeksionetKeshillitService,
  ) {}

  @Put(':id')
  @ApiOperation({ summary: 'Përditëson përmbajtjen editoriale të seksionit' })
  @ApiOkResponse({ type: SeksionKeshilliEditorialResponse })
  @ApiBadRequestResponse({
    description: 'Body bosh, fusha të palejuara ose të dhëna të pavlefshme.',
  })
  @ApiNotFoundResponse({ description: 'Seksioni nuk ekziston.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PerditesoSeksionKeshilliDto,
  ): Promise<SeksionKeshilliEditorialResponse> {
    return this.seksionetKeshillitService.updateEditorialContent(id, dto);
  }
}
