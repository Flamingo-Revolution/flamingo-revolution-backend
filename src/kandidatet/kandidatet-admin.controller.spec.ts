import { ValidationPipe } from '@nestjs/common';
import { RoliUserit } from '@prisma/client';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { PerditesoKandidatDto } from './dto/perditeso-kandidat.dto';
import { KandidatetAdminController } from './kandidatet-admin.controller';

describe('KandidatetAdminController', () => {
  it('lejon vetëm rolet editoriale dhe administrative', () => {
    const roles = Reflect.getMetadata(
      ROLES_KEY,
      KandidatetAdminController,
    ) as RoliUserit[];

    expect(roles).toEqual([
      RoliUserit.gazetar,
      RoliUserit.super_gazetar,
      RoliUserit.moderator,
      RoliUserit.super_admin,
    ]);
  });

  it('refuzon fusha jashtë DTO-së', async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });

    await expect(
      pipe.transform(
        { statusi: 'i_aprovuar' },
        {
          type: 'body',
          metatype: PerditesoKandidatDto,
          data: '',
        },
      ),
    ).rejects.toThrow();
  });
});
