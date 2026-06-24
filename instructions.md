# Udhëzime për backend-in

Ky projekt është backend-i i një platforme qytetare, të fokusuar te
transparenca e një nisme ligjore dhe te pjesëmarrja anonime e publikut.

Platforma ka dy qëllime:

1. Transparencë publike rreth nismës qytetare dhe ligjore.
2. Pjesëmarrje anonime përmes propozimit të kandidatëve, propozimit të ideve
   dhe votave mbështetëse.

Në MVP fokusi kryesor është moduli i kandidatëve dhe i këshillit.

## Parimet e zhvillimit

- Kodi duhet të jetë i thjeshtë, i drejtpërdrejtë dhe i lexueshëm.
- Shmang abstraksionet e panevojshme, automatizimet e fshehta dhe zgjidhjet
  që sillen si “blackboxes”.
- Emrat e klasave, metodave dhe variablave duhet të tregojnë qartë qëllimin.
- Çdo modul duhet të ketë një përgjegjësi të kuptueshme.
- Logjika e biznesit vendoset në service, jo në controller.
- Controller-at validojnë kërkesën, thërrasin service-in dhe kthejnë përgjigjen.
- Prisma është e vetmja mënyrë për të komunikuar me bazën e të dhënave.
- Mos krijo repository, event bus ose shtresa të tjera pa një nevojë konkrete.
- Prefero funksione të vogla dhe rrjedhë të qartë ndaj modeleve komplekse.
- Gabimet duhet të jenë të qarta dhe të trajtohen në mënyrë të parashikueshme.
- Kodi i sigurisë, votimit dhe moderimit duhet të mbulohet me teste.
- Dokumentacioni dhe shpjegimet e projektit shkruhen në shqip.
- Kodi TypeScript përdor emërtime teknike të qëndrueshme me domenin aktual.
- Komentet përdoren vetëm kur shpjegojnë arsyen e një vendimi, jo kur
  përsërisin atë që kodi tregon vetë.
- Mos shto funksionalitete jashtë MVP-së pa kërkesë të qartë.

Qëllimi është që një zhvillues i ri ta kuptojë rrjedhën e kodit pa pasur nevojë
të zbulojë sjellje të fshehura ose konventa të padokumentuara.

## Arkitektura

- Backend: NestJS
- Gjuha: TypeScript
- API: REST
- Baza e të dhënave: PostgreSQL
- ORM: Prisma
- Autentikimi i stafit: Clerk
- Dokumentimi i API-së: Swagger/OpenAPI
- Shpërndarja: Docker

Përdor një monolit modular:

- një aplikacion backend;
- një bazë të dhënash PostgreSQL;
- pa microservices;
- pa blockchain;
- pa Redis në fazën e parë.

Qytetarët nuk krijojnë llogari dhe mbeten anonimë. Vetëm stafi identifikohet
përmes Clerk.

## Aktorët

### Qytetari anonim

Mund të:

- shohë seksionet e këshillit;
- shohë kandidatët e aprovuar;
- propozojë kandidat;
- mbështesë një kandidat.

Nuk mund të:

- identifikohet;
- ndryshojë të dhëna;
- publikojë drejtpërdrejt përmbajtje.

### Gazetar

Mund të:

- ndryshojë tekstet dhe fotografinë e kandidatit;
- ndryshojë titullin, përshkrimin dhe imazhin e seksionit;
- krijojë ose përditësojë përmbajtje publike.

Nuk mund të:

- ndryshojë votat;
- ndryshojë përqindjet;
- manipulojë rezultatet.

### Moderator

Mund të:

- aprovojë kandidatët;
- refuzojë kandidatët;
- shënojë kandidatët e zgjedhur;
- shqyrtojë dërgesat e dyshimta.

### Super-administrator

Mund të:

- menaxhojë stafin dhe rolet;
- menaxhojë të dhënat e sistemit;
- menaxhojë strukturën e seksioneve kur është e nevojshme.

As super-administratori nuk duhet të ndryshojë drejtpërdrejt numrin e votave.
Një votë hiqet vetëm duke u shpallur e pavlefshme dhe duke ruajtur arsyen.

## Autentikimi dhe autorizimi

Clerk menaxhon identifikimin dhe sesionin. Backend-i menaxhon rolet dhe lejet.

Tabela `users` përmban:

- `id`
- `clerk_user_id`
- `emri_nofka`
- `email`
- `roli`
- `statusi`
- `created_at`
- `updated_at`
- `deleted_at`

Vlerat e `roli`:

- `super_admin`
- `super_gazetar`
- `gazetar`
- `moderator`
- `tech_admin`

Vlerat e `statusi`:

- `aktiv`
- `i_caktivizuar`

Rrjedha e autorizimit:

1. Verifiko JWT-në e Clerk.
2. Merr `clerk_user_id`.
3. Gjej përdoruesin lokal në `users`.
4. Kontrollo statusin dhe rolin.
5. Lejo ose refuzo veprimin.

## Seksionet e këshillit

Tabela `seksionet_keshillit` ruan gjashtë kategoritë fikse.

Fushat:

- `id`
- `key`
- `titulli`
- `pershkrimi`
- `numri_vendeve`
- `renditja`
- `url_imazhi`
- `created_at`
- `updated_at`
- `deleted_at`

Të dhënat fillestare:

| key | titulli | vende |
| --- | --- | ---: |
| `juriste_kushtetutare` | Juristë Kushtetutarë | 2 |
| `deputete_partish_te_reja` | Deputetë Partish të Reja | 3 |
| `gazetare` | Gazetarë të Besuar | 2 |
| `aktiviste` | Aktivistë nga Baza | 2 |
| `ekspert_mjedisor` | Ekspert Mjedisor | 1 |
| `koordinator_teknik` | Koordinator Teknik | 1 |

Gazetari mund të ndryshojë:

- `titulli`
- `pershkrimi`
- `url_imazhi`

Gazetari nuk mund të ndryshojë:

- `key`
- `numri_vendeve`
- `renditja`
- votat ose përqindjet.

Vetëm `super_admin` mund të ndryshojë fushat strukturore. Një seksion i fshirë
logjikisht ka vlerë në `deleted_at` dhe nuk shfaqet publikisht.

## Kandidatët

Tabela `kandidatet` përmban:

- `id`
- `seksion_id`
- `emri`
- `bio`
- `url_foto`
- `statusi`
- `created_at`
- `updated_at`
- `deleted_at`

Vlerat e statusit:

- `ne_shqyrtim`
- `i_aprovuar`
- `i_refuzuar`
- `i_zgjedhur`

Publiku sheh vetëm kandidatët me status `i_aprovuar` ose `i_zgjedhur`.

Gazetari mund të ndryshojë vetëm përmbajtjen e profilit:

- `emri`
- `bio`
- `url_foto`

Statusi ndryshohet vetëm nga një moderator ose administrator me lejen
përkatëse.

## Votat e kandidatëve

Tabela `votat_kandidateve` përmban:

- `id`
- `kandidat_id`
- `fingerprint_hash`
- `ip_hash`
- `created_at`

Në MVP nuk ruhet `user_agent_hash`.

Mos ruaj:

- IP-në e papërpunuar;
- fingerprint-in e papërpunuar;
- përqindje të ndryshueshme;
- emrin ose email-in e qytetarit.

Lejohet një votë mbështetëse për kandidat për çdo kombinim
`fingerprint_hash` dhe `ip_hash`.

Numri i votave llogaritet nga tabela e votave. Përqindja llogaritet në backend:

```text
votat e kandidatit / votat totale në seksion * 100
```

Përqindja nuk ruhet në tabelën e kandidatit.

## Moderimi

Tabela `moderimet_kandidateve` përmban:

- `id`
- `kandidat_id`
- `veprimi`
- `arsyeja`
- `moderator_id`
- `created_at`

Vlerat e `veprimi`:

- `aprovim`
- `refuzim`
- `zgjedhje`

Çdo aprovim, refuzim ose ndryshim tjetër statusi duhet të krijojë një regjistrim
moderimi. Ndryshimi i statusit dhe regjistrimi i moderimit duhet të kryhen në të
njëjtin transaksion të bazës së të dhënave.

## Mbrojtja kundër spam-it

Tabela `kufizimet_anti_spam_kandidate` përmban:

- `id`
- `lloji_veprimit`
- `fingerprint_hash`
- `ip_hash`
- `created_at`

Shembuj të `lloji_veprimit`:

- `propozim_kandidati`
- `votim_kandidati`

Rregullat e MVP-së:

- maksimumi 3 propozime kandidatësh në 24 orë për fingerprint/IP;
- maksimumi 20 vota kandidatësh në 1 orë për fingerprint/IP;
- maksimumi 1 votë për të njëjtin kandidat për fingerprint/IP;
- CAPTCHA në propozimin e kandidatit;
- CAPTCHA ose CAPTCHA e heshtur në votim;
- fushë honeypot në formularët publikë;
- filtër fjalori para pranimit të propozimit;
- moderim manual para publikimit.

Cloudflare Turnstile është ofruesi i preferuar i CAPTCHA-s. Integrimi duhet të
kalojë përmes një service-i të vogël me hyrje dhe dalje të qartë, në mënyrë që
të mund të testohet dhe zëvendësohet pa ndikuar logjikën e kandidatëve.

## API publike

### Merr seksionet dhe kandidatët

`GET /api/publike/seksionet-keshillit/kandidatet`

Duhet të:

- kthejë seksionet pa `deleted_at`, sipas `renditja`;
- përfshijë kandidatët e aprovuar ose të zgjedhur;
- përfshijë `numri_votave`;
- përfshijë `perqindja_votave`;
- mos ekspozojë hash-e ose fusha të brendshme moderimi.

### Propozo kandidat

`POST /api/publike/kandidatet`

Hyrja:

- `seksion_id`
- `emri`
- `bio`
- `url_foto`, opsionale
- `captcha_token`
- fusha e fshehur honeypot

Rrjedha:

1. Valido hyrjen.
2. Kontrollo honeypot-in.
3. Verifiko CAPTCHA-n.
4. Gjenero hash-et nga të dhënat e kërkesës me një sekret të serverit.
5. Kontrollo kufizimet në `kufizimet_anti_spam_kandidate`.
6. Kontrollo përmbajtjen e papërshtatshme.
7. Ruaj kandidatin me status `ne_shqyrtim`.
8. Ruaj ngjarjen anti-spam në të njëjtin transaksion.
9. Kthe një mesazh suksesi pa të dhëna të brendshme.

### Mbështet kandidat

`POST /api/publike/kandidatet/:id/mbeshtet`

Rrjedha:

1. Kontrollo kandidatin dhe statusin e tij.
2. Verifiko CAPTCHA-n kur kërkohet.
3. Gjenero hash-et.
4. Kontrollo votën e dyfishtë.
5. Kontrollo kufirin e votimit.
6. Ruaj votën dhe ngjarjen anti-spam në një transaksion.
7. Kthe numrin dhe përqindjen e përditësuar.

Një kufizim unik në bazën e të dhënave duhet të garantojë mbrojtjen nga vota
e dyfishtë edhe kur dy kërkesa arrijnë njëkohësisht.

## API e administrimit

### Kandidatët në shqyrtim

`GET /api/admin/kandidatet/ne-shqyrtim`

Rolet:

- `moderator`
- `super_admin`

### Aprovo kandidat

`POST /api/admin/kandidatet/:id/aprovo`

Rolet:

- `moderator`
- `super_admin`

Ndrysho statusin në `i_aprovuar` dhe krijo veprimin `aprovim` në të njëjtin
transaksion.

### Refuzo kandidat

`POST /api/admin/kandidatet/:id/refuzo`

Rolet:

- `moderator`
- `super_admin`

Kërkon `arsyeja`. Ndrysho statusin në `i_refuzuar` dhe krijo veprimin
`refuzim` në të njëjtin transaksion.

### Përditëso përmbajtjen e kandidatit

`PUT /api/admin/kandidatet/:id`

Rolet:

- `gazetar`
- `super_gazetar`
- `moderator`
- `super_admin`

DTO-ja duhet të pranojë vetëm fushat e lejuara të profilit. Mos prano fusha
votimi, statusi ose anti-spam.

### Përditëso përmbajtjen e seksionit

`PUT /api/admin/seksionet-keshillit/:id`

Gazetari mund të ndryshojë vetëm:

- `titulli`
- `pershkrimi`
- `url_imazhi`

## Struktura e moduleve

```text
src/
├── anti-spam/
├── auth/
├── common/
├── kandidatet/
├── moderimet-kandidateve/
├── users/
├── prisma/
├── seksionet-keshillit/
└── votat-kandidateve/
```

Çdo modul funksional duhet të ketë vetëm skedarët që i nevojiten:

- controller;
- service;
- DTO;
- guard ose helper vetëm kur është konkretisht i nevojshëm.

Mos krijo interface, base class ose wrapper vetëm për të ndjekur një model
arkitekturor. Shto një abstraksion vetëm kur eliminon përsëritje reale ose
vendos një kufi të dobishëm, si verifikimi i CAPTCHA-s.

## Siguria dhe privatësia

- Mos ruaj IP ose fingerprint të papërpunuar.
- Përdor një sekret serveri për krijimin e hash-eve.
- Mos kërko identifikim për qytetarët.
- Mos mbledh emër ose email të qytetarit.
- Mos ekspozo hash-et anti-spam.
- Mos lejo ndryshim manual të votave ose përqindjeve.
- Mos publiko kandidat pa aprovim.
- Valido të gjitha DTO-të me whitelist.
- Përdor transaksione kur një veprim duhet të krijojë disa regjistrime.
- Mos përfshi sekrete në kod, log-e ose përgjigje API.
- Votat janë sinjal publik mbështetjeje, jo votim ligjor zyrtar.

## Rendi i implementimit

1. Prisma schema.
2. Migrimi fillestar.
3. Seed-i i gjashtë seksioneve.
4. Verifikimi i Clerk.
5. Përdoruesit lokalë dhe kontrolli i roleve.
6. Leximi publik i seksioneve dhe kandidatëve.
7. Propozimi publik i kandidatit.
8. Lista e kandidatëve në shqyrtim.
9. Aprovimi dhe refuzimi.
10. Mbështetja publike e kandidatit.
11. Llogaritja e votave dhe përqindjeve.
12. Mbrojtja dhe regjistrimi anti-spam.
13. Swagger dhe testet.
14. Docker dhe konfigurimi i shpërndarjes.

Mos shto Redis, komente publike, forum, blockchain ose rrjedha komplekse në
MVP.
