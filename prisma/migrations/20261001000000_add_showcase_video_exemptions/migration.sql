-- CreateEnum
CREATE TYPE "ShowcaseVideoExemptionStatus" AS ENUM ('AWAITING_REGISTRATION', 'MATCHED', 'REVOKED');

-- CreateEnum
CREATE TYPE "ShowcaseVideoExemptionReason" AS ENUM ('PREVIOUSLY_OBSERVED_LIVE');

-- CreateTable
CREATE TABLE "ShowcaseVideoExemption" (
    "id" TEXT NOT NULL,
    "eventSlug" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "ninHash" TEXT NOT NULL,
    "ninLast4" TEXT NOT NULL,
    "reason" "ShowcaseVideoExemptionReason" NOT NULL DEFAULT 'PREVIOUSLY_OBSERVED_LIVE',
    "status" "ShowcaseVideoExemptionStatus" NOT NULL DEFAULT 'AWAITING_REGISTRATION',
    "authorisedByStaffUserId" TEXT NOT NULL,
    "authorisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "matchedApplicationId" TEXT,
    "matchedAt" TIMESTAMP(3),
    "revokedByStaffUserId" TEXT,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShowcaseVideoExemption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShowcaseVideoExemption_matchedApplicationId_key" ON "ShowcaseVideoExemption"("matchedApplicationId");

-- CreateIndex
CREATE INDEX "ShowcaseVideoExemption_eventSlug_status_idx" ON "ShowcaseVideoExemption"("eventSlug", "status");

-- CreateIndex
CREATE INDEX "ShowcaseVideoExemption_authorisedByStaffUserId_idx" ON "ShowcaseVideoExemption"("authorisedByStaffUserId");

-- CreateIndex
CREATE INDEX "ShowcaseVideoExemption_revokedByStaffUserId_idx" ON "ShowcaseVideoExemption"("revokedByStaffUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ShowcaseVideoExemption_eventSlug_ninHash_key" ON "ShowcaseVideoExemption"("eventSlug", "ninHash");

-- AddForeignKey
ALTER TABLE "ShowcaseVideoExemption" ADD CONSTRAINT "ShowcaseVideoExemption_authorisedByStaffUserId_fkey" FOREIGN KEY ("authorisedByStaffUserId") REFERENCES "StaffUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShowcaseVideoExemption" ADD CONSTRAINT "ShowcaseVideoExemption_matchedApplicationId_fkey" FOREIGN KEY ("matchedApplicationId") REFERENCES "ShowcaseApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShowcaseVideoExemption" ADD CONSTRAINT "ShowcaseVideoExemption_revokedByStaffUserId_fkey" FOREIGN KEY ("revokedByStaffUserId") REFERENCES "StaffUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
