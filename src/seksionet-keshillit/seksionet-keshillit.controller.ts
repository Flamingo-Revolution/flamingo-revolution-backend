import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SeksionKeshilliPublikResponse } from './dto/seksion-keshilli-publik.response';
import { SeksionetKeshillitService } from './seksionet-keshillit.service';

@ApiTags('Publike - Seksionet e këshillit')
@Controller('publike/seksionet-keshillit')
export class SeksionetKeshillitController {
  constructor(
    private readonly seksionetKeshillitService: SeksionetKeshillitService,
  ) {}

  @Get('kandidatet')
  @ApiOperation({
    summary: 'Kthen seksionet publike me kandidatët dhe votat e tyre',
  })
  @ApiOkResponse({ type: [SeksionKeshilliPublikResponse] })
  findPublicWithCandidates(): Promise<SeksionKeshilliPublikResponse[]> {
    return this.seksionetKeshillitService.findPublicWithCandidates();
  }
}
