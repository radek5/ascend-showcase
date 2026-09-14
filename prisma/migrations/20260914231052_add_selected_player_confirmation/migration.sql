-- CreateEnum
CREATE TYPE "ShowcaseKitSize" AS ENUM ('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL');

-- CreateTable
CREATE TABLE "ShowcaseSelectedPlayerConfirmation" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "attendanceConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "shirtSize" "ShowcaseKitSize",
    "shortsSize" "ShowcaseKitSize",
    "sockSize" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactRelationship" TEXT,
    "emergencyContactPhone" TEXT,
    "dietaryRequirements" TEXT,
    "medicalUpdate" TEXT,
    "accessibilityNeeds" TEXT,
    "otherRequirements" TEXT,
    "informationConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShowcaseSelectedPlayerConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShowcaseSelectedPlayerConfirmation_applicationId_key" ON "ShowcaseSelectedPlayerConfirmation"("applicationId");

-- CreateIndex
CREATE INDEX "ShowcaseSelectedPlayerConfirmation_confirmedAt_idx" ON "ShowcaseSelectedPlayerConfirmation"("confirmedAt");

-- AddForeignKey
ALTER TABLE "ShowcaseSelectedPlayerConfirmation" ADD CONSTRAINT "ShowcaseSelectedPlayerConfirmation_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ShowcaseApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
