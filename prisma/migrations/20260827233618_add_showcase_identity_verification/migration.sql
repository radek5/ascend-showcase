-- CreateEnum
CREATE TYPE "ShowcaseIdentityDocumentType" AS ENUM ('PASSPORT', 'NIN', 'HEADSHOT');

-- CreateEnum
CREATE TYPE "ShowcaseIdentityDocumentStatus" AS ENUM ('UPLOADED', 'VERIFIED', 'MORE_INFO_REQUIRED', 'REJECTED');

-- AlterTable
ALTER TABLE "ShowcaseApplication" ADD COLUMN     "identityVerificationCompletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ShowcaseIdentityDocument" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" "ShowcaseIdentityDocumentType" NOT NULL,
    "status" "ShowcaseIdentityDocumentStatus" NOT NULL DEFAULT 'UPLOADED',
    "originalFilename" TEXT,
    "mimeType" TEXT,
    "sizeBytes" BIGINT,
    "storageProvider" TEXT,
    "storageKey" TEXT,
    "uploadedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShowcaseIdentityDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShowcaseIdentityDocument_applicationId_idx" ON "ShowcaseIdentityDocument"("applicationId");

-- CreateIndex
CREATE INDEX "ShowcaseIdentityDocument_status_idx" ON "ShowcaseIdentityDocument"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ShowcaseIdentityDocument_applicationId_type_key" ON "ShowcaseIdentityDocument"("applicationId", "type");

-- AddForeignKey
ALTER TABLE "ShowcaseIdentityDocument" ADD CONSTRAINT "ShowcaseIdentityDocument_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ShowcaseApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
