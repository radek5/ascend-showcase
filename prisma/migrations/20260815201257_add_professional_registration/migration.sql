-- CreateEnum
CREATE TYPE "ProfessionalRegistrationRole" AS ENUM ('CLUB_REPRESENTATIVE', 'SCOUT', 'FOOTBALL_AGENT');

-- CreateEnum
CREATE TYPE "ProfessionalRegistrationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'MORE_INFO_REQUIRED', 'REJECTED', 'ACCREDITED', 'CHECKED_IN');

-- CreateTable
CREATE TABLE "ProfessionalRegistration" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "accreditationNumber" TEXT,
    "checkInToken" TEXT,
    "checkedInAt" TIMESTAMP(3),
    "approvalEmailSentAt" TIMESTAMP(3),
    "status" "ProfessionalRegistrationStatus" NOT NULL DEFAULT 'DRAFT',
    "role" "ProfessionalRegistrationRole" NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "headshotUrl" TEXT,
    "arrivalTransfer" BOOLEAN NOT NULL DEFAULT false,
    "arrivalDate" TIMESTAMP(3),
    "arrivalTime" TEXT,
    "arrivalAirline" TEXT,
    "arrivalFlight" TEXT,
    "departureTransfer" BOOLEAN NOT NULL DEFAULT false,
    "departureDate" TIMESTAMP(3),
    "departureTime" TEXT,
    "departureAirline" TEXT,
    "departureFlight" TEXT,
    "hotelStatus" TEXT,
    "lagosAddress" TEXT,
    "safeguardingConsent" BOOLEAN NOT NULL DEFAULT false,
    "privacyConsent" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfessionalRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfessionalRegistration_accreditationNumber_key" ON "ProfessionalRegistration"("accreditationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ProfessionalRegistration_checkInToken_key" ON "ProfessionalRegistration"("checkInToken");

-- CreateIndex
CREATE INDEX "ProfessionalRegistration_eventId_idx" ON "ProfessionalRegistration"("eventId");

-- CreateIndex
CREATE INDEX "ProfessionalRegistration_status_idx" ON "ProfessionalRegistration"("status");

-- CreateIndex
CREATE INDEX "ProfessionalRegistration_role_idx" ON "ProfessionalRegistration"("role");

-- CreateIndex
CREATE INDEX "ProfessionalRegistration_email_idx" ON "ProfessionalRegistration"("email");

-- AddForeignKey
ALTER TABLE "ProfessionalRegistration" ADD CONSTRAINT "ProfessionalRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
