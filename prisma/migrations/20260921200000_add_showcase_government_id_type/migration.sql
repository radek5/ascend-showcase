-- CreateEnum
CREATE TYPE "ShowcaseGovernmentIdType" AS ENUM ('PASSPORT', 'DRIVERS_LICENCE');

-- AlterTable
ALTER TABLE "ShowcaseIdentityDocument"
ADD COLUMN "governmentIdType" "ShowcaseGovernmentIdType";
