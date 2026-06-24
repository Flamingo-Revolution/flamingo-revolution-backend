# Flamingo Revolution Backend

Backend-i i platformës qytetare Flamingo Revolution. Projekti ndërtohet me
NestJS, TypeScript, PostgreSQL dhe Prisma.

Aktualisht repository përmban skeletin e aplikacionit, modelin Prisma dhe
seed-in e seksioneve. Logjika e API-së do të implementohet sipas rendit të
përcaktuar te [instructions.md](./instructions.md).

## Qëllimi i MVP-së

MVP-ja fokusohet te:

- gjashtë seksionet fikse të këshillit;
- propozimi anonim i kandidatëve;
- moderimi i kandidatëve;
- mbështetja anonime e kandidatëve;
- llogaritja transparente e votave dhe përqindjeve;
- administrimi i përmbajtjes nga stafi.

Mbështetja publike është sinjal qytetar dhe nuk përfaqëson votim ligjor zyrtar.

## Teknologjitë

- Node.js
- npm
- NestJS
- TypeScript
- PostgreSQL
- Prisma
- Clerk për autentikimin e stafit
- Cloudflare Turnstile për CAPTCHA
- Swagger/OpenAPI
- Docker

## Kërkesat lokale

Për zhvillim pa Docker nevojiten:

- Node.js 22 ose më i ri;
- npm;
- PostgreSQL.

Për zhvillim me Docker nevojiten:

- Docker;
- Docker Compose.

## Instalimi

Instalo varësitë:

```bash
npm install
```

Në Windows PowerShell, nëse ekzekutimi i `npm.ps1` është i bllokuar, përdor:

```powershell
npm.cmd install
```

Krijo konfigurimin lokal:

```powershell
Copy-Item .env.example .env
```

Plotëso vlerat e nevojshme te `.env`, pastaj gjenero Prisma Client:

```bash
npm run prisma:generate
```

Nis aplikacionin:

```bash
npm run start:dev
```

API-ja do të jetë në:

```text
http://localhost:3000/api
```

Swagger do të jetë në:

```text
http://localhost:3000/api/docs
```

## Konfigurimi i ambientit

Skedari `.env.example` përmban variablat e pritshme:

| Variabla | Qëllimi |
| --- | --- |
| `NODE_ENV` | Ambienti i ekzekutimit |
| `PORT` | Porta e API-së |
| `DATABASE_URL` | Lidhja me PostgreSQL |
| `CLERK_SECRET_KEY` | Çelësi privat i Clerk |
| `CLERK_PUBLISHABLE_KEY` | Çelësi publik i Clerk |
| `TURNSTILE_SECRET_KEY` | Çelësi i Cloudflare Turnstile |
| `HASH_SECRET` | Sekreti për hash-et anonime |

Mos vendos sekrete reale në `.env.example` dhe mos bëj commit skedarin `.env`.

## Komandat

| Komanda | Përshkrimi |
| --- | --- |
| `npm run start:dev` | Nis serverin me rindërtim automatik |
| `npm run build` | Kompilon aplikacionin |
| `npm run start:prod` | Nis versionin e kompiluar |
| `npm run lint` | Kontrollon dhe formaton kodin me ESLint |
| `npm test` | Ekzekuton testet |
| `npm run test:watch` | Ekzekuton testet në watch mode |
| `npm run test:cov` | Gjeneron raportin e mbulimit |
| `npm run prisma:generate` | Gjeneron Prisma Client |
| `npm run prisma:migrate:dev` | Krijon ose aplikon migrime lokale |
| `npm run prisma:seed` | Ekzekuton seed-in |

## Përdorimi me Docker

Krijo `.env` përpara nisjes:

```powershell
Copy-Item .env.example .env
```

Pastaj:

```bash
docker compose up --build
```

Ky konfigurim nis:

- API-në në portën `3000`;
- PostgreSQL në portën `5432`.

## Struktura

```text
.
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── anti-spam/
│   ├── auth/
│   ├── common/
│   ├── kandidatet/
│   ├── moderimet-kandidateve/
│   ├── users/
│   ├── prisma/
│   ├── seksionet-keshillit/
│   ├── votat-kandidateve/
│   ├── app.module.ts
│   └── main.ts
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── instructions.md
└── package.json
```

## Si organizohet kodi

- Controller-i merret me HTTP-në, validimin dhe përgjigjen.
- Service-i përmban logjikën e biznesit.
- Prisma service përdoret për bazën e të dhënave.
- DTO-të përcaktojnë saktësisht hyrjet e lejuara.
- Guard-at përdoren vetëm për autentikim dhe autorizim.
- Veprimet që ndryshojnë disa tabela kryhen në transaksion.

Mbaje rrjedhën të dukshme. Një zhvillues duhet të jetë në gjendje të ndjekë një
kërkesë nga controller-i te service-i dhe te Prisma pa kërkuar mekanizma të
fshehur.

## Modeli i të dhënave

Skema Prisma përmban:

- `seksionet_keshillit`;
- `kandidatet`;
- `votat_kandidateve`;
- `moderimet_kandidateve`;
- `users`;
- `kufizimet_anti_spam_kandidate`.

Tabela `users` ruan përdoruesit e stafit. Rolet editoriale janë `gazetar` dhe
`super_gazetar`. Autentikimi kryhet nga Clerk, prandaj nuk ruhet
`password_hash`.

Fushat kohore përdorin emërtimet `created_at`, `updated_at` dhe, kur nevojitet
fshirja logjike, `deleted_at`.

Kandidati ka vetëm një fushë përshkrimi, `bio`. Statuset e tij janë:

- `ne_shqyrtim`;
- `i_aprovuar`;
- `i_refuzuar`;
- `i_zgjedhur`.

Veprimet e moderimit janë vetëm `aprovim`, `refuzim` dhe `zgjedhje`.

## Standardet e kodit

- Zgjidh zgjidhjen më të thjeshtë që plotëson saktë kërkesën.
- Mos shto shtresa ose modele arkitekturore pa nevojë konkrete.
- Shmang funksionet e gjata dhe emrat e paqartë.
- Mos vendos logjikë biznesi në controller.
- Mos kap gabime vetëm për t'i fshehur.
- Kthe gabime të qarta dhe të parashikueshme.
- Shkruaj teste për logjikën e votimit, moderimit, roleve dhe anti-spam-it.
- Mbaj dokumentacionin në shqip.
- Përditëso README-n dhe Swagger-in kur ndryshon sjellja publike.

## Gjendja aktuale

Skeleti kompilohet dhe kalon kontrollin e lint-it. Skema Prisma, migrimi
fillestar dhe seed-i i seksioneve janë implementuar. Ende nuk janë implementuar:

- verifikimi Clerk;
- verifikimi Turnstile;
- endpoint-et;
- logjika e votimit dhe moderimit;
- testet funksionale.

Implementimi duhet të vazhdojë sipas prioriteteve te
[instructions.md](./instructions.md).
