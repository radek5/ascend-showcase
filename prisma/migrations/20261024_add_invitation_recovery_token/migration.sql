-- AlterTable
ALTER TABLE "ShowcaseSelectedPlayer" ADD COLUMN     "invitationRecoveryTokenHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ShowcaseSelectedPlayer_invitationRecoveryTokenHash_key" ON "ShowcaseSelectedPlayer"("invitationRecoveryTokenHash");

