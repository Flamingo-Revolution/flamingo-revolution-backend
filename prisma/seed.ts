import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seksionet = [
  {
    key: 'juriste_kushtetutare',
    titulli: 'Juristë Kushtetutarë',
    pershkrimi: 'Juristët kontrollojnë vlefshmërinë kushtetuese.',
    numri_vendeve: 2,
    renditja: 1,
  },
  {
    key: 'deputete_partish_te_reja',
    titulli: 'Deputetë Partish të Reja',
    pershkrimi: 'Përfaqësues nga partitë e reja.',
    numri_vendeve: 3,
    renditja: 2,
  },
  {
    key: 'gazetare',
    titulli: 'Gazetarë të Besuar',
    pershkrimi: 'Gazetarë me përvojë dhe besueshmëri publike.',
    numri_vendeve: 2,
    renditja: 3,
  },
  {
    key: 'aktiviste',
    titulli: 'Aktivistë nga Baza',
    pershkrimi: 'Aktivistë me përvojë në komunitet.',
    numri_vendeve: 2,
    renditja: 4,
  },
  {
    key: 'ekspert_mjedisor',
    titulli: 'Ekspert Mjedisor',
    pershkrimi: 'Ekspertizë për çështjet mjedisore.',
    numri_vendeve: 1,
    renditja: 5,
  },
  {
    key: 'koordinator_teknik',
    titulli: 'Koordinator Teknik',
    pershkrimi: 'Koordinim i punës dhe sistemeve teknike.',
    numri_vendeve: 1,
    renditja: 6,
  },
];

async function main(): Promise<void> {
  for (const seksioni of seksionet) {
    await prisma.seksioniKeshillit.upsert({
      where: { key: seksioni.key },
      update: seksioni,
      create: seksioni,
    });
  }

  const clerkUserId = process.env.INITIAL_SUPER_ADMIN_CLERK_USER_ID;

  if (clerkUserId) {
    const emriNofka = process.env.INITIAL_SUPER_ADMIN_NAME || 'admin';

    await prisma.user.upsert({
      where: { clerk_user_id: clerkUserId },
      update: {
        emri_nofka: emriNofka,
        roli: 'super_admin',
        statusi: 'aktiv',
        deleted_at: null,
      },
      create: {
        clerk_user_id: clerkUserId,
        emri_nofka: emriNofka,
        roli: 'super_admin',
      },
    });
  }
}

main()
  .catch((error: unknown) => {
    console.error('Seed-i dështoi:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
