/*
  Warnings:

  - You are about to drop the column `primaryVideoKey` on the `ShowcaseApplication` table. All the data in the column will be lost.
  - You are about to drop the column `primaryVideoUrl` on the `ShowcaseApplication` table. All the data in the column will be lost.
  - You are about to drop the column `supportingVideoKey` on the `ShowcaseApplication` table. All the data in the column will be lost.
  - You are about to drop the column `supportingVideoUrl` on the `ShowcaseApplication` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ShowcaseVideoType" AS ENUM ('MATCH_1', 'MATCH_2', 'HIGHLIGHTS', 'ADDITIONAL_MATCH', 'FULL_MATCH', 'ASSESSMENT_CLIP', 'AI_TRACKED');

-- CreateEnum
CREATE TYPE "ShowcaseVideoStatus" AS ENUM ('REQUESTED', 'UPLOADING', 'SUBMITTED', 'PROCESSING', 'READY', 'REJECTED');

-- AlterTable
ALTER TABLE "ShowcaseApplication" DROP COLUMN "primaryVideoKey",
DROP COLUMN "primaryVideoUrl",
DROP COLUMN "supportingVideoKey",
DROP COLUMN "supportingVideoUrl",
ADD COLUMN     "additionalVideoCompletedAt" TIMESTAMP(3),
ADD COLUMN     "additionalVideoDeadline" TIMESTAMP(3),
ADD COLUMN     "additionalVideoRequestNotes" TEXT,
ADD COLUMN     "additionalVideoRequestedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ShowcaseApplicationVideo" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" "ShowcaseVideoType" NOT NULL,
    "status" "ShowcaseVideoStatus" NOT NULL DEFAULT 'SUBMITTED',
    "originalFilename" TEXT,
    "mimeType" TEXT,
    "sizeBytes" BIGINT,
    "durationSeconds" INTEGER,
    "storageProvider" TEXT,
    "storageKey" TEXT,
    "playbackUrl" TEXT,
    "originalUrl" TEXT,
    "processedUrl" TEXT,
    "requestedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShowcaseApplicationVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShowcaseApplicationVideo_applicationId_idx" ON "ShowcaseApplicationVideo"("applicationId");

-- CreateIndex
CREATE INDEX "ShowcaseApplicationVideo_applicationId_type_idx" ON "ShowcaseApplicationVideo"("applicationId", "type");

-- CreateIndex
CREATE INDEX "ShowcaseApplicationVideo_status_idx" ON "ShowcaseApplicationVideo"("status");

-- AddForeignKey
ALTER TABLE "ShowcaseApplicationVideo" ADD CONSTRAINT "ShowcaseApplicationVideo_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ShowcaseApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
