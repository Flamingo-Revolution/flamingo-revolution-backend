import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoliUserit } from '@prisma/client';
import { Roles } from './decorators/roles.decorator';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthenticatedRequest } from './types/authenticated-request';

@ApiTags('Autentikimi')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class AuthController {
  @Get('profili')
  @Roles(
    RoliUserit.super_admin,
    RoliUserit.super_gazetar,
    RoliUserit.gazetar,
    RoliUserit.moderator,
    RoliUserit.tech_admin,
  )
  @ApiOperation({ summary: 'Kthen profilin e stafit të autentikuar' })
  getProfile(@Req() request: AuthenticatedRequest) {
    const { id, clerk_user_id, emri_nofka, roli, statusi } = request.staffUser;

    return {
      id,
      clerk_user_id,
      emri_nofka,
      roli,
      statusi,
    };
  }
}
