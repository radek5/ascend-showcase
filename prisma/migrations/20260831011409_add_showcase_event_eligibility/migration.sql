-- CreateEnum
CREATE TYPE "ShowcaseCompetitionCategory" AS ENUM ('MEN', 'WOMEN', 'OPEN');

-- CreateEnum
CREATE TYPE "PlayerSex" AS ENUM ('MALE', 'FEMALE');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "showcaseCompetitionCategory" "ShowcaseCompetitionCategory" NOT NULL DEFAULT 'OPEN',
ADD COLUMN     "showcaseMaximumAge" INTEGER,
ADD COLUMN     "showcaseMinimumAge" INTEGER;

-- AlterTable
ALTER TABLE "ShowcaseApplication" ADD COLUMN     "sex" "PlayerSex";
