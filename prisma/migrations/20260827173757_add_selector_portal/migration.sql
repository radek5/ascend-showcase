/*
  Warnings:

  - A unique constraint covering the columns `[assessmentCode]` on the table `ShowcaseApplication` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SelectorAssignmentStatus" AS ENUM ('ASSIGNED', 'IN_REVIEW', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SelectorRecommendation" AS ENUM ('NOT_SELECTED', 'REQUEST_MORE_VIDEO', 'SECOND_REVIEW', 'LONGLIST');

-- AlterTable
ALTER TABLE "ShowcaseApplication" ADD COLUMN     "assessmentCode" TEXT;

-- CreateTable
CREATE TABLE "SelectorAccount" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "staffUserId" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SelectorAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelectorAssignment" (
    "id" TEXT NOT NULL,
    "selectorId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "round" INTEGER NOT NULL DEFAULT 1,
    "status" "SelectorAssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SelectorAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelectorAssessment" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "technical" INTEGER,
    "tactical" INTEGER,
    "physical" INTEGER,
    "positioning" INTEGER,
    "decisionMaking" INTEGER,
    "potential" INTEGER,
    "notes" TEXT,
    "recommendation" "SelectorRecommendation",
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SelectorAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SelectorAccount_email_key" ON "SelectorAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SelectorAccount_staffUserId_key" ON "SelectorAccount"("staffUserId");

-- CreateIndex
CREATE INDEX "SelectorAccount_active_idx" ON "SelectorAccount"("active");

-- CreateIndex
CREATE INDEX "SelectorAssignment_selectorId_status_idx" ON "SelectorAssignment"("selectorId", "status");

-- CreateIndex
CREATE INDEX "SelectorAssignment_applicationId_idx" ON "SelectorAssignment"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "SelectorAssignment_selectorId_applicationId_round_key" ON "SelectorAssignment"("selectorId", "applicationId", "round");

-- CreateIndex
CREATE UNIQUE INDEX "SelectorAssessment_assignmentId_key" ON "SelectorAssessment"("assignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "ShowcaseApplication_assessmentCode_key" ON "ShowcaseApplication"("assessmentCode");

-- AddForeignKey
ALTER TABLE "SelectorAccount" ADD CONSTRAINT "SelectorAccount_staffUserId_fkey" FOREIGN KEY ("staffUserId") REFERENCES "StaffUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectorAssignment" ADD CONSTRAINT "SelectorAssignment_selectorId_fkey" FOREIGN KEY ("selectorId") REFERENCES "SelectorAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectorAssignment" ADD CONSTRAINT "SelectorAssignment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ShowcaseApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectorAssessment" ADD CONSTRAINT "SelectorAssessment_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "SelectorAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
