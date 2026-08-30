-- CreateEnum
CREATE TYPE "ShowcaseApplicationStatus" AS ENUM ('DRAFT', 'AWAITING_VIDEO', 'AWAITING_ASSESSMENT_FEE', 'SUBMITTED', 'ELIGIBILITY_REVIEW', 'VIDEO_REVIEW', 'LONGLISTED', 'FINAL_REVIEW', 'SELECTED', 'RESERVE', 'NOT_SELECTED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "ShowcaseApplication" (
    "id" TEXT NOT NULL,
    "eventSlug" TEXT NOT NULL,
    "userId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "age" INTEGER,
    "nationality" TEXT,
    "countryOfResidence" TEXT,
    "stateRegion" TEXT,
    "city" TEXT,
    "position" TEXT,
    "secondaryPosition" TEXT,
    "preferredFoot" TEXT,
    "currentClub" TEXT,
    "currentAcademy" TEXT,
    "footballBackground" TEXT,
    "primaryVideoUrl" TEXT,
    "primaryVideoKey" TEXT,
    "supportingVideoUrl" TEXT,
    "supportingVideoKey" TEXT,
    "assessmentFeeRequired" BOOLEAN NOT NULL DEFAULT true,
    "assessmentFeeAmount" INTEGER,
    "assessmentFeeCurrency" TEXT NOT NULL DEFAULT 'NGN',
    "assessmentFeePaid" BOOLEAN NOT NULL DEFAULT false,
    "assessmentFeePaidAt" TIMESTAMP(3),
    "assessmentPaymentReference" TEXT,
    "assessmentDisclaimerAccepted" BOOLEAN NOT NULL DEFAULT false,
    "assessmentDisclaimerAcceptedAt" TIMESTAMP(3),
    "status" "ShowcaseApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "eligibilityReviewedAt" TIMESTAMP(3),
    "videoReviewedAt" TIMESTAMP(3),
    "longlistedAt" TIMESTAMP(3),
    "finalReviewedAt" TIMESTAMP(3),
    "selectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShowcaseApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShowcaseApplication_eventSlug_idx" ON "ShowcaseApplication"("eventSlug");

-- CreateIndex
CREATE INDEX "ShowcaseApplication_email_idx" ON "ShowcaseApplication"("email");

-- CreateIndex
CREATE INDEX "ShowcaseApplication_status_idx" ON "ShowcaseApplication"("status");

-- CreateIndex
CREATE INDEX "ShowcaseApplication_eventSlug_status_idx" ON "ShowcaseApplication"("eventSlug", "status");
