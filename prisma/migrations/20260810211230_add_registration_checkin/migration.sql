/*
  Warnings:

  - A unique constraint covering the columns `[checkInToken]` on the table `Registration` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "checkInToken" TEXT,
ADD COLUMN     "checkedInAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Registration_checkInToken_key" ON "Registration"("checkInToken");
