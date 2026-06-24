-- CreateEnum
CREATE TYPE "StatusiKandidatit" AS ENUM ('ne_shqyrtim', 'i_aprovuar', 'i_refuzuar', 'i_zgjedhur');

-- CreateEnum
CREATE TYPE "VeprimiModerimit" AS ENUM ('aprovim', 'refuzim', 'zgjedhje');

-- CreateEnum
CREATE TYPE "RoliUserit" AS ENUM ('super_admin', 'gazetar', 'super_gazetar', 'moderator', 'tech_admin');

-- CreateEnum
CREATE TYPE "StatusiUserit" AS ENUM ('aktiv', 'i_caktivizuar');

-- CreateEnum
CREATE TYPE "LlojiVeprimitAntiSpam" AS ENUM ('propozim_kandidati', 'votim_kandidati');

-- CreateTable
CREATE TABLE "seksionet_keshillit" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "titulli" TEXT NOT NULL,
    "pershkrimi" TEXT NOT NULL,
    "numri_vendeve" INTEGER NOT NULL,
    "renditja" INTEGER NOT NULL,
    "url_imazhi" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "seksionet_keshillit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kandidatet" (
    "id" SERIAL NOT NULL,
    "seksion_id" INTEGER NOT NULL,
    "emri" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "url_foto" TEXT,
    "statusi" "StatusiKandidatit" NOT NULL DEFAULT 'ne_shqyrtim',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "kandidatet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votat_kandidateve" (
    "id" SERIAL NOT NULL,
    "kandidat_id" INTEGER NOT NULL,
    "fingerprint_hash" TEXT NOT NULL,
    "ip_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "votat_kandidateve_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderimet_kandidateve" (
    "id" SERIAL NOT NULL,
    "kandidat_id" INTEGER NOT NULL,
    "veprimi" "VeprimiModerimit" NOT NULL,
    "arsyeja" TEXT,
    "moderator_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderimet_kandidateve_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "clerk_user_id" TEXT NOT NULL,
    "emri_nofka" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "roli" "RoliUserit" NOT NULL,
    "statusi" "StatusiUserit" NOT NULL DEFAULT 'aktiv',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kufizimet_anti_spam_kandidate" (
    "id" SERIAL NOT NULL,
    "lloji_veprimit" "LlojiVeprimitAntiSpam" NOT NULL,
    "ip_hash" TEXT NOT NULL,
    "fingerprint_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kufizimet_anti_spam_kandidate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seksionet_keshillit_key_key" ON "seksionet_keshillit"("key");

-- CreateIndex
CREATE UNIQUE INDEX "seksionet_keshillit_renditja_key" ON "seksionet_keshillit"("renditja");

-- CreateIndex
CREATE INDEX "seksionet_keshillit_deleted_at_idx" ON "seksionet_keshillit"("deleted_at");

-- CreateIndex
CREATE INDEX "kandidatet_seksion_id_statusi_deleted_at_idx" ON "kandidatet"("seksion_id", "statusi", "deleted_at");

-- CreateIndex
CREATE INDEX "votat_kandidateve_kandidat_id_idx" ON "votat_kandidateve"("kandidat_id");

-- CreateIndex
CREATE UNIQUE INDEX "votat_kandidateve_kandidat_id_fingerprint_hash_ip_hash_key" ON "votat_kandidateve"("kandidat_id", "fingerprint_hash", "ip_hash");

-- CreateIndex
CREATE INDEX "moderimet_kandidateve_kandidat_id_idx" ON "moderimet_kandidateve"("kandidat_id");

-- CreateIndex
CREATE INDEX "moderimet_kandidateve_moderator_id_idx" ON "moderimet_kandidateve"("moderator_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_user_id_key" ON "users"("clerk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_statusi_deleted_at_idx" ON "users"("statusi", "deleted_at");

-- CreateIndex
CREATE INDEX "kufizimet_anti_spam_kandidate_lloji_veprimit_ip_hash_create_idx" ON "kufizimet_anti_spam_kandidate"("lloji_veprimit", "ip_hash", "created_at");

-- CreateIndex
CREATE INDEX "kufizimet_anti_spam_kandidate_lloji_veprimit_fingerprint_ha_idx" ON "kufizimet_anti_spam_kandidate"("lloji_veprimit", "fingerprint_hash", "created_at");

-- AddForeignKey
ALTER TABLE "kandidatet" ADD CONSTRAINT "kandidatet_seksion_id_fkey" FOREIGN KEY ("seksion_id") REFERENCES "seksionet_keshillit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votat_kandidateve" ADD CONSTRAINT "votat_kandidateve_kandidat_id_fkey" FOREIGN KEY ("kandidat_id") REFERENCES "kandidatet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderimet_kandidateve" ADD CONSTRAINT "moderimet_kandidateve_kandidat_id_fkey" FOREIGN KEY ("kandidat_id") REFERENCES "kandidatet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderimet_kandidateve" ADD CONSTRAINT "moderimet_kandidateve_moderator_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
