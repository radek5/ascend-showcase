-- AlterTable
ALTER TABLE "ShowcaseApplication" ADD COLUMN     "currentAcademyEndDate" TIMESTAMP(3),
ADD COLUMN     "currentAcademyStartDate" TIMESTAMP(3),
ADD COLUMN     "currentClubEndDate" TIMESTAMP(3),
ADD COLUMN     "currentClubStartDate" TIMESTAMP(3),
ADD COLUMN     "footballStatusDeclarationAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "footballStatusDeclarationAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "footballStatusLastConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "footballStatusVerification" TEXT NOT NULL DEFAULT 'NOT_DECLARED';
