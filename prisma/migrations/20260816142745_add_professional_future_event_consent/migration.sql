-- AlterTable
ALTER TABLE "ProfessionalRegistration" ADD COLUMN     "futureEventConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "futureEventConsentAt" TIMESTAMP(3);
