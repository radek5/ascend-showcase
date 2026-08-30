-- CreateEnum
CREATE TYPE "ShowcasePaymentProvider" AS ENUM ('PAYSTACK');

-- CreateEnum
CREATE TYPE "ShowcasePaymentStatus" AS ENUM ('INITIALISED', 'PENDING', 'SUCCESS', 'FAILED', 'ABANDONED');

-- CreateTable
CREATE TABLE "ShowcasePayment" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "provider" "ShowcasePaymentProvider" NOT NULL,
    "status" "ShowcasePaymentStatus" NOT NULL DEFAULT 'INITIALISED',
    "reference" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "providerTransactionId" TEXT,
    "providerStatus" TEXT,
    "gatewayResponse" TEXT,
    "initialisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShowcasePayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShowcasePayment_reference_key" ON "ShowcasePayment"("reference");

-- CreateIndex
CREATE INDEX "ShowcasePayment_applicationId_idx" ON "ShowcasePayment"("applicationId");

-- CreateIndex
CREATE INDEX "ShowcasePayment_status_idx" ON "ShowcasePayment"("status");

-- CreateIndex
CREATE INDEX "ShowcasePayment_provider_idx" ON "ShowcasePayment"("provider");

-- AddForeignKey
ALTER TABLE "ShowcasePayment" ADD CONSTRAINT "ShowcasePayment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ShowcaseApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
