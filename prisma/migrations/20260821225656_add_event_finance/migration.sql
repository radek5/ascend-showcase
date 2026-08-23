-- CreateEnum
CREATE TYPE "FinanceExpenseStatus" AS ENUM ('PLANNED', 'QUOTED', 'APPROVED', 'COMMITTED', 'PART_PAID', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FinanceIncomeStatus" AS ENUM ('EXPECTED', 'AGREED', 'INVOICED', 'PART_RECEIVED', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FinanceCategoryType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateTable
CREATE TABLE "FinanceCategory" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" "FinanceCategoryType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceExpense" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "categoryId" TEXT,
    "supplierName" TEXT,
    "description" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "budgetAmount" INTEGER,
    "forecastAmount" INTEGER,
    "committedAmount" INTEGER,
    "paidAmount" INTEGER NOT NULL DEFAULT 0,
    "status" "FinanceExpenseStatus" NOT NULL DEFAULT 'PLANNED',
    "invoiceReference" TEXT,
    "paymentReference" TEXT,
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdByStaffUserId" TEXT,
    "approvedByStaffUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceIncome" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "categoryId" TEXT,
    "sourceName" TEXT NOT NULL,
    "description" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "expectedAmount" INTEGER,
    "agreedAmount" INTEGER,
    "invoicedAmount" INTEGER,
    "receivedAmount" INTEGER NOT NULL DEFAULT 0,
    "status" "FinanceIncomeStatus" NOT NULL DEFAULT 'EXPECTED',
    "invoiceReference" TEXT,
    "paymentReference" TEXT,
    "dueDate" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "commercialRelationshipId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceIncome_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FinanceCategory_eventId_idx" ON "FinanceCategory"("eventId");

-- CreateIndex
CREATE INDEX "FinanceCategory_type_idx" ON "FinanceCategory"("type");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceCategory_eventId_type_name_key" ON "FinanceCategory"("eventId", "type", "name");

-- CreateIndex
CREATE INDEX "FinanceExpense_eventId_idx" ON "FinanceExpense"("eventId");

-- CreateIndex
CREATE INDEX "FinanceExpense_categoryId_idx" ON "FinanceExpense"("categoryId");

-- CreateIndex
CREATE INDEX "FinanceExpense_status_idx" ON "FinanceExpense"("status");

-- CreateIndex
CREATE INDEX "FinanceExpense_dueDate_idx" ON "FinanceExpense"("dueDate");

-- CreateIndex
CREATE INDEX "FinanceIncome_eventId_idx" ON "FinanceIncome"("eventId");

-- CreateIndex
CREATE INDEX "FinanceIncome_categoryId_idx" ON "FinanceIncome"("categoryId");

-- CreateIndex
CREATE INDEX "FinanceIncome_status_idx" ON "FinanceIncome"("status");

-- CreateIndex
CREATE INDEX "FinanceIncome_dueDate_idx" ON "FinanceIncome"("dueDate");

-- CreateIndex
CREATE INDEX "FinanceIncome_commercialRelationshipId_idx" ON "FinanceIncome"("commercialRelationshipId");

-- AddForeignKey
ALTER TABLE "FinanceCategory" ADD CONSTRAINT "FinanceCategory_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceExpense" ADD CONSTRAINT "FinanceExpense_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceExpense" ADD CONSTRAINT "FinanceExpense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FinanceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceIncome" ADD CONSTRAINT "FinanceIncome_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceIncome" ADD CONSTRAINT "FinanceIncome_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FinanceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceIncome" ADD CONSTRAINT "FinanceIncome_commercialRelationshipId_fkey" FOREIGN KEY ("commercialRelationshipId") REFERENCES "CommercialRelationship"("id") ON DELETE SET NULL ON UPDATE CASCADE;
