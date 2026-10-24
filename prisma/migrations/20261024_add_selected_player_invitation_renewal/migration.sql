-- AlterTable
ALTER TABLE "ShowcaseSelectedPlayer" ADD COLUMN     "invitationRenewalCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "invitationRenewalRequestedAt" TIMESTAMP(3);

