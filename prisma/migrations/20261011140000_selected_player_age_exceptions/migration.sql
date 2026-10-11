-- AlterTable
ALTER TABLE "ShowcaseSelectedPlayer" ADD COLUMN     "ageExceptionApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ageExceptionApprovedAt" TIMESTAMP(3),
ADD COLUMN     "ageExceptionReason" TEXT;
