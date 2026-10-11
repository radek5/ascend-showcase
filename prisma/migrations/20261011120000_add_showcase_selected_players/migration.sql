-- CreateTable
CREATE TABLE "ShowcaseSelectedPlayer" (
    "id" TEXT NOT NULL,
    "eventSlug" TEXT NOT NULL,
    "batchCode" TEXT NOT NULL,
    "sourceRowNumber" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "reportedAge" INTEGER,
    "position" TEXT NOT NULL,
    "whatsappNumber" TEXT,
    "footballSelected" BOOLEAN NOT NULL DEFAULT true,
    "registrationTokenHash" TEXT,
    "registrationTokenExpiresAt" TIMESTAMP(3),
    "registrationTokenUsedAt" TIMESTAMP(3),
    "matchedApplicationId" TEXT,
    "matchedAt" TIMESTAMP(3),
    "registrationCompletedAt" TIMESTAMP(3),
    "identityClearedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShowcaseSelectedPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShowcaseSelectedPlayer_registrationTokenHash_key" ON "ShowcaseSelectedPlayer"("registrationTokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "ShowcaseSelectedPlayer_matchedApplicationId_key" ON "ShowcaseSelectedPlayer"("matchedApplicationId");

-- CreateIndex
CREATE INDEX "ShowcaseSelectedPlayer_eventSlug_batchCode_idx" ON "ShowcaseSelectedPlayer"("eventSlug", "batchCode");

-- CreateIndex
CREATE INDEX "ShowcaseSelectedPlayer_eventSlug_footballSelected_idx" ON "ShowcaseSelectedPlayer"("eventSlug", "footballSelected");

-- CreateIndex
CREATE INDEX "ShowcaseSelectedPlayer_whatsappNumber_idx" ON "ShowcaseSelectedPlayer"("whatsappNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ShowcaseSelectedPlayer_eventSlug_batchCode_sourceRowNumber_key" ON "ShowcaseSelectedPlayer"("eventSlug", "batchCode", "sourceRowNumber");
