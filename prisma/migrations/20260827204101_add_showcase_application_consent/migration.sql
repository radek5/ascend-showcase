-- AlterTable
ALTER TABLE "ShowcaseApplication" ADD COLUMN     "declarationConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "eventConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "futureEventConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "futureEventConsentAt" TIMESTAMP(3),
ADD COLUMN     "medicalConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "medicalNotes" TEXT,
ADD COLUMN     "playerAgreementConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "privacyConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "termsConsent" BOOLEAN NOT NULL DEFAULT false;
