-- CreateEnum
CREATE TYPE "CommercialOrganisationType" AS ENUM ('SPONSOR', 'PARTNER', 'SUPPLIER');

-- CreateEnum
CREATE TYPE "CommercialPipelineStatus" AS ENUM ('PROSPECT', 'CONTACTED', 'DISCUSSION', 'PROPOSAL_SENT', 'NEGOTIATION', 'CONFIRMED', 'ACTIVATED', 'COMPLETED', 'DECLINED');

-- CreateTable
CREATE TABLE "CommercialOrganisation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CommercialOrganisationType" NOT NULL,
    "sector" TEXT,
    "website" TEXT,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommercialOrganisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommercialRelationship" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "status" "CommercialPipelineStatus" NOT NULL DEFAULT 'PROSPECT',
    "packageName" TEXT,
    "proposedValue" INTEGER,
    "agreedValue" INTEGER,
    "currency" TEXT,
    "nextAction" TEXT,
    "nextActionDate" TIMESTAMP(3),
    "notes" TEXT,
    "showOnWebsite" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommercialRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommercialOrganisation_name_idx" ON "CommercialOrganisation"("name");

-- CreateIndex
CREATE INDEX "CommercialOrganisation_type_idx" ON "CommercialOrganisation"("type");

-- CreateIndex
CREATE INDEX "CommercialRelationship_eventId_idx" ON "CommercialRelationship"("eventId");

-- CreateIndex
CREATE INDEX "CommercialRelationship_status_idx" ON "CommercialRelationship"("status");

-- CreateIndex
CREATE INDEX "CommercialRelationship_nextActionDate_idx" ON "CommercialRelationship"("nextActionDate");

-- CreateIndex
CREATE UNIQUE INDEX "CommercialRelationship_organisationId_eventId_key" ON "CommercialRelationship"("organisationId", "eventId");

-- AddForeignKey
ALTER TABLE "CommercialRelationship" ADD CONSTRAINT "CommercialRelationship_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "CommercialOrganisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommercialRelationship" ADD CONSTRAINT "CommercialRelationship_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
