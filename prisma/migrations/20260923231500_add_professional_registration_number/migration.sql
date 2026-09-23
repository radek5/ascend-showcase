-- AlterTable
ALTER TABLE "ProfessionalRegistration"
ADD COLUMN "registrationNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ProfessionalRegistration_registrationNumber_key"
ON "ProfessionalRegistration"("registrationNumber");
