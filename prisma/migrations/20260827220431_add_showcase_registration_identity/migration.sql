/*
  Warnings:

  - A unique constraint covering the columns `[registrationNumber]` on the table `ShowcaseApplication` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[checkInToken]` on the table `ShowcaseApplication` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ShowcaseApplication" ADD COLUMN     "checkInToken" TEXT,
ADD COLUMN     "confirmationEmailSentAt" TIMESTAMP(3),
ADD COLUMN     "registrationNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ShowcaseApplication_registrationNumber_key" ON "ShowcaseApplication"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ShowcaseApplication_checkInToken_key" ON "ShowcaseApplication"("checkInToken");
