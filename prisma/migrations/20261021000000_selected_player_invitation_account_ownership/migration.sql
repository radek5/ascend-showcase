-- AlterTable
ALTER TABLE "ShowcaseSelectedPlayer" ADD COLUMN     "registeredApplicantUserId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ShowcaseSelectedPlayer_registeredApplicantUserId_key" ON "ShowcaseSelectedPlayer"("registeredApplicantUserId");

-- AddForeignKey
ALTER TABLE "ShowcaseSelectedPlayer" ADD CONSTRAINT "ShowcaseSelectedPlayer_registeredApplicantUserId_fkey" FOREIGN KEY ("registeredApplicantUserId") REFERENCES "ApplicantUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
