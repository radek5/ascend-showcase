-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "futureEventConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "futureEventConsentAt" TIMESTAMP(3);
