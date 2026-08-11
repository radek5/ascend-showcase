-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "registrationInstructions" TEXT,
ADD COLUMN     "registrationVenue" TEXT;

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "confirmationEmailSentAt" TIMESTAMP(3);
