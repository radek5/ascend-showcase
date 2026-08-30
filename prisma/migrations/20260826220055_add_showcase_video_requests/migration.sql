-- AlterTable
ALTER TABLE "ShowcaseApplicationVideo" ADD COLUMN     "requestId" TEXT;

-- CreateTable
CREATE TABLE "ShowcaseVideoRequest" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "requestedCount" INTEGER NOT NULL,
    "requestedVideoType" "ShowcaseVideoType" NOT NULL DEFAULT 'ADDITIONAL_MATCH',
    "instructions" TEXT,
    "deadline" TIMESTAMP(3),
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShowcaseVideoRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShowcaseVideoRequest_applicationId_idx" ON "ShowcaseVideoRequest"("applicationId");

-- CreateIndex
CREATE INDEX "ShowcaseVideoRequest_completedAt_idx" ON "ShowcaseVideoRequest"("completedAt");

-- CreateIndex
CREATE INDEX "ShowcaseApplicationVideo_requestId_idx" ON "ShowcaseApplicationVideo"("requestId");

-- AddForeignKey
ALTER TABLE "ShowcaseApplicationVideo" ADD CONSTRAINT "ShowcaseApplicationVideo_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ShowcaseVideoRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShowcaseVideoRequest" ADD CONSTRAINT "ShowcaseVideoRequest_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ShowcaseApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
