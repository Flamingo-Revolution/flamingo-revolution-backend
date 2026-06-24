import { ValidationPipe } from '@nestjs/common';
import { RoliUserit } from '@prisma/client';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { PerditesoSeksionKeshilliDto } from './dto/perditeso-seksion-keshilli.dto';
import { SeksionetKeshillitAdminController } from './seksionet-keshillit-admin.controller';

describe('SeksionetKeshillitAdminController', () => {
  it('lejon vetëm rolet editoriale dhe administrative', () => {
    const roles = Reflect.getMetadata(
      ROLES_KEY,
      SeksionetKeshillitAdminController,
    ) as RoliUserit[];

    expect(roles).toEqual([
      RoliUserit.gazetar,
      RoliUserit.super_gazetar,
      RoliUserit.moderator,
      RoliUserit.super_admin,
    ]);
  });

  it('refuzon fushat strukturore jashtë DTO-së', async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });

    await expect(
      pipe.transform(
        { key: 'key_i_ri', numri_vendeve: 10, renditja: 2 },
        {
          type: 'body',
          metatype: PerditesoSeksionKeshilliDto,
          data: '',
        },
      ),
    ).rejects.toThrow();
  });
});
