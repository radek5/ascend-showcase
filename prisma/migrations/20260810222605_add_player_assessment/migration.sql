-- CreateTable
CREATE TABLE "PlayerAssessment" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'DEMO',
    "overallScore" INTEGER,
    "technicalScore" INTEGER,
    "tacticalScore" INTEGER,
    "physicalScore" INTEGER,
    "movementScore" INTEGER,
    "positioningScore" INTEGER,
    "decisionMakingScore" INTEGER,
    "passingScore" INTEGER,
    "defensiveImpactScore" INTEGER,
    "ballControlScore" INTEGER,
    "tacklingScore" INTEGER,
    "aerialAbilityScore" INTEGER,
    "workRateScore" INTEGER,
    "composureScore" INTEGER,
    "topSpeedKmh" DECIMAL(65,30),
    "distanceCoveredKm" DECIMAL(65,30),
    "sprintCount" INTEGER,
    "highIntensityRuns" INTEGER,
    "accelerations" INTEGER,
    "aiSummary" TEXT,
    "confidenceScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlayerAssessment_registrationId_key" ON "PlayerAssessment"("registrationId");

-- AddForeignKey
ALTER TABLE "PlayerAssessment" ADD CONSTRAINT "PlayerAssessment_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
