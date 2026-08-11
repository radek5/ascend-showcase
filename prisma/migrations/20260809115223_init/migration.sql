-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('DRAFT', 'AWAITING_PAYMENT', 'PAID', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "RegistrationStep" AS ENUM ('PLAYER', 'CONTACT', 'REPRESENTATION', 'VIDEO', 'MEDICAL_CONSENT', 'REVIEW', 'PAYMENT', 'CONFIRMATION');

-- CreateEnum
CREATE TYPE "RepresentationStatus" AS ENUM ('UNREPRESENTED_OPEN', 'REPRESENTED', 'STATUS_UNCLEAR');

-- CreateEnum
CREATE TYPE "RepresentationVerificationStatus" AS ENUM ('DECLARED', 'PENDING_REVIEW', 'AGENT_CONFIRMATION_PENDING', 'CONFIRMED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "RepresentationChangeType" AS ENUM ('INITIAL_DECLARATION', 'UPDATED_BY_PLAYER', 'UPDATED_BY_GUARDIAN', 'UPDATED_BY_ADMIN', 'AGENT_CONFIRMED', 'AGENT_DISPUTED');

-- CreateEnum
CREATE TYPE "ExclusiveRepresentation" AS ENUM ('YES', 'NO', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('NOT_SUBMITTED', 'SUBMITTED', 'PROCESSING', 'READY', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "ScoutInterestLevel" AS ENUM ('WATCH', 'INTERESTED', 'HIGH_INTEREST', 'REQUEST_INTRODUCTION', 'CLOSED');

-- CreateEnum
CREATE TYPE "IntroductionStatus" AS ENUM ('REQUESTED', 'REVIEWING', 'APPROVED', 'DECLINED', 'INTRODUCED', 'FOLLOW_UP', 'CLOSED');

-- CreateEnum
CREATE TYPE "IntroductionPartyType" AS ENUM ('PLAYER', 'GUARDIAN', 'AGENT');

-- CreateEnum
CREATE TYPE "ProspectStatus" AS ENUM ('NOT_ELIGIBLE', 'POTENTIAL', 'REVIEW', 'APPROVED', 'DECLINED', 'REPRESENTATION_DISCUSSION', 'SIGNED');

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "edition" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "registrationStartsAt" TIMESTAMP(3),
    "registrationEndsAt" TIMESTAMP(3),
    "footballStartsAt" TIMESTAMP(3),
    "footballEndsAt" TIMESTAMP(3),
    "registrationOpen" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "capacity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL,
    "registrationNumber" TEXT,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'DRAFT',
    "currentStep" "RegistrationStep" NOT NULL DEFAULT 'PLAYER',
    "eventId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "nationality" TEXT,
    "primaryPosition" TEXT,
    "secondaryPosition" TEXT,
    "preferredFoot" TEXT,
    "currentClub" TEXT,
    "academyName" TEXT,
    "heightCm" INTEGER,
    "weightKg" INTEGER,
    "email" TEXT,
    "phone" TEXT,
    "guardianName" TEXT,
    "guardianRelationship" TEXT,
    "guardianEmail" TEXT,
    "guardianPhone" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "representationStatus" "RepresentationStatus",
    "prospectStatus" "ProspectStatus" NOT NULL DEFAULT 'POTENTIAL',
    "medicalNotes" TEXT,
    "medicalConsent" BOOLEAN NOT NULL DEFAULT false,
    "eventConsent" BOOLEAN NOT NULL DEFAULT false,
    "privacyConsent" BOOLEAN NOT NULL DEFAULT false,
    "mediaConsent" BOOLEAN NOT NULL DEFAULT false,
    "declarationConsent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepresentationDeclaration" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "status" "RepresentationStatus" NOT NULL,
    "verificationStatus" "RepresentationVerificationStatus" NOT NULL DEFAULT 'DECLARED',
    "agentName" TEXT,
    "agencyName" TEXT,
    "agentEmail" TEXT,
    "agentPhone" TEXT,
    "agentCountry" TEXT,
    "fifaLicenceNumber" TEXT,
    "representationStart" TIMESTAMP(3),
    "representationEnd" TIMESTAMP(3),
    "exclusiveRepresentation" "ExclusiveRepresentation",
    "agentContactConsent" BOOLEAN NOT NULL DEFAULT false,
    "declarationConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "declaredByName" TEXT,
    "declaredAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepresentationDeclaration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepresentationHistory" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "previousStatus" "RepresentationStatus",
    "newStatus" "RepresentationStatus" NOT NULL,
    "changeType" "RepresentationChangeType" NOT NULL,
    "changedByName" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RepresentationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerVideo" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "status" "VideoStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "sourceType" TEXT,
    "externalUrl" TEXT,
    "storageProvider" TEXT,
    "storageKey" TEXT,
    "playbackUrl" TEXT,
    "originalFilename" TEXT,
    "mimeType" TEXT,
    "sizeBytes" BIGINT,
    "durationSeconds" INTEGER,
    "submittedAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT NOT NULL,
    "providerReference" TEXT,
    "providerTransaction" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "failureReason" TEXT,
    "initiatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scout" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "organisationName" TEXT,
    "organisationType" TEXT,
    "role" TEXT,
    "country" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoutInterest" (
    "id" TEXT NOT NULL,
    "scoutId" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "level" "ScoutInterestLevel" NOT NULL DEFAULT 'WATCH',
    "privateNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScoutInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Introduction" (
    "id" TEXT NOT NULL,
    "introductionNumber" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "requestedByScoutId" TEXT NOT NULL,
    "status" "IntroductionStatus" NOT NULL DEFAULT 'REQUESTED',
    "routedTo" "IntroductionPartyType",
    "representationStatusAtRequest" "RepresentationStatus",
    "requestReason" TEXT,
    "internalNotes" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "introducedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Introduction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_active_idx" ON "Event"("active");

-- CreateIndex
CREATE INDEX "Event_city_idx" ON "Event"("city");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_registrationNumber_key" ON "Registration"("registrationNumber");

-- CreateIndex
CREATE INDEX "Registration_eventId_idx" ON "Registration"("eventId");

-- CreateIndex
CREATE INDEX "Registration_status_idx" ON "Registration"("status");

-- CreateIndex
CREATE INDEX "Registration_representationStatus_idx" ON "Registration"("representationStatus");

-- CreateIndex
CREATE INDEX "Registration_prospectStatus_idx" ON "Registration"("prospectStatus");

-- CreateIndex
CREATE INDEX "Registration_email_idx" ON "Registration"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RepresentationDeclaration_registrationId_key" ON "RepresentationDeclaration"("registrationId");

-- CreateIndex
CREATE INDEX "RepresentationHistory_registrationId_idx" ON "RepresentationHistory"("registrationId");

-- CreateIndex
CREATE INDEX "RepresentationHistory_createdAt_idx" ON "RepresentationHistory"("createdAt");

-- CreateIndex
CREATE INDEX "PlayerVideo_registrationId_idx" ON "PlayerVideo"("registrationId");

-- CreateIndex
CREATE INDEX "PlayerVideo_status_idx" ON "PlayerVideo"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_providerReference_key" ON "Payment"("providerReference");

-- CreateIndex
CREATE INDEX "Payment_registrationId_idx" ON "Payment"("registrationId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE INDEX "Scout_eventId_idx" ON "Scout"("eventId");

-- CreateIndex
CREATE INDEX "Scout_organisationName_idx" ON "Scout"("organisationName");

-- CreateIndex
CREATE INDEX "ScoutInterest_registrationId_idx" ON "ScoutInterest"("registrationId");

-- CreateIndex
CREATE INDEX "ScoutInterest_level_idx" ON "ScoutInterest"("level");

-- CreateIndex
CREATE UNIQUE INDEX "ScoutInterest_scoutId_registrationId_key" ON "ScoutInterest"("scoutId", "registrationId");

-- CreateIndex
CREATE UNIQUE INDEX "Introduction_introductionNumber_key" ON "Introduction"("introductionNumber");

-- CreateIndex
CREATE INDEX "Introduction_eventId_idx" ON "Introduction"("eventId");

-- CreateIndex
CREATE INDEX "Introduction_registrationId_idx" ON "Introduction"("registrationId");

-- CreateIndex
CREATE INDEX "Introduction_requestedByScoutId_idx" ON "Introduction"("requestedByScoutId");

-- CreateIndex
CREATE INDEX "Introduction_status_idx" ON "Introduction"("status");

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepresentationDeclaration" ADD CONSTRAINT "RepresentationDeclaration_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepresentationHistory" ADD CONSTRAINT "RepresentationHistory_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerVideo" ADD CONSTRAINT "PlayerVideo_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scout" ADD CONSTRAINT "Scout_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoutInterest" ADD CONSTRAINT "ScoutInterest_scoutId_fkey" FOREIGN KEY ("scoutId") REFERENCES "Scout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoutInterest" ADD CONSTRAINT "ScoutInterest_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Introduction" ADD CONSTRAINT "Introduction_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Introduction" ADD CONSTRAINT "Introduction_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Introduction" ADD CONSTRAINT "Introduction_requestedByScoutId_fkey" FOREIGN KEY ("requestedByScoutId") REFERENCES "Scout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
