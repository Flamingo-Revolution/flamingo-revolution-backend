import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { RoliUserit } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedRequest } from '../auth/types/authenticated-request';
import { KandidatAdminResponse } from './dto/kandidat-admin.response';
import { RefuzoKandidatDto } from './dto/refuzo-kandidat.dto';
import { ModerimetKandidateveService } from './moderimet-kandidateve.service';

@ApiTags('Admin - Moderimi i kandidatëve')
@ApiBearerAuth()
@Controller('admin/kandidatet')
@UseGuards(ClerkAuthGuard, RolesGuard)
@Roles(RoliUserit.moderator, RoliUserit.super_admin)
@ApiUnauthorizedResponse({
  description: 'Mungon ose është i pavlefshëm token-i.',
})
@ApiForbiddenResponse({ description: 'Roli i përdoruesit nuk lejohet.' })
export class ModerimetKandidateveController {
  constructor(
    private readonly moderimetKandidateveService: ModerimetKandidateveService,
  ) {}

  @Get('ne-shqyrtim')
  @ApiOperation({ summary: 'Kthen kandidatët që presin moderim' })
  @ApiOkResponse({ type: [KandidatAdminResponse] })
  findPending(): Promise<KandidatAdminResponse[]> {
    return this.moderimetKandidateveService.findPending();
  }

  @Post(':id/aprovo')
  @ApiOperation({ summary: 'Aprovon një kandidat në shqyrtim' })
  @ApiOkResponse({ type: KandidatAdminResponse })
  @ApiNotFoundResponse({ description: 'Kandidati nuk ekziston.' })
  @ApiConflictResponse({
    description: 'Kandidati nuk është më në shqyrtim.',
  })
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ): Promise<KandidatAdminResponse> {
    return this.moderimetKandidateveService.approve(id, request.staffUser.id);
  }

  @Post(':id/refuzo')
  @ApiOperation({ summary: 'Refuzon një kandidat në shqyrtim' })
  @ApiOkResponse({ type: KandidatAdminResponse })
  @ApiNotFoundResponse({ description: 'Kandidati nuk ekziston.' })
  @ApiConflictResponse({
    description: 'Kandidati nuk është më në shqyrtim.',
  })
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RefuzoKandidatDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<KandidatAdminResponse> {
    return this.moderimetKandidateveService.reject(
      id,
      request.staffUser.id,
      dto.arsyeja,
    );
  }
}
