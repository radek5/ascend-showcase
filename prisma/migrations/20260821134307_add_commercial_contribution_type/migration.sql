-- CreateEnum
CREATE TYPE "CommercialContributionType" AS ENUM ('CASH', 'IN_KIND', 'CASH_AND_IN_KIND');

-- AlterTable
ALTER TABLE "CommercialRelationship" ADD COLUMN     "contributionType" "CommercialContributionType",
ADD COLUMN     "inKindDescription" TEXT;
