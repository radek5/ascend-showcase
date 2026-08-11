-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "registrationFeeAmount" INTEGER,
ADD COLUMN     "registrationFeeCurrency" TEXT NOT NULL DEFAULT 'NGN';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "baseAmount" INTEGER,
ADD COLUMN     "baseCurrency" TEXT,
ADD COLUMN     "fxQuotedAt" TIMESTAMP(3),
ADD COLUMN     "fxRate" DECIMAL(65,30),
ADD COLUMN     "fxSource" TEXT;
