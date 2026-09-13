/*
  Warnings:

  - A unique constraint covering the columns `[eventSlug,reserveRank]` on the table `ShowcaseApplication` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ShowcaseSelectionResponse" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "reserveCapacity" INTEGER,
ADD COLUMN     "selectionDecisionsReleasedAt" TIMESTAMP(3),
ADD COLUMN     "selectionDecisionsReleasedByStaffUserId" TEXT;

-- AlterTable
ALTER TABLE "ShowcaseApplication" ADD COLUMN     "reservePromotedAt" TIMESTAMP(3),
ADD COLUMN     "reserveRank" INTEGER,
ADD COLUMN     "selectionDecisionReleasedAt" TIMESTAMP(3),
ADD COLUMN     "selectionOutcomeEmailSentAt" TIMESTAMP(3),
ADD COLUMN     "selectionOutcomeMessageId" TEXT,
ADD COLUMN     "selectionResponse" "ShowcaseSelectionResponse",
ADD COLUMN     "selectionResponseAt" TIMESTAMP(3),
ADD COLUMN     "selectionResponseDeadline" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "ShowcaseApplication_eventSlug_reserveRank_key" ON "ShowcaseApplication"("eventSlug", "reserveRank");
