ALTER TABLE "ShowcaseApplication"
ADD COLUMN "reservePromotedByStaffUserId" TEXT,
ADD COLUMN "reservePromotionReason" TEXT,
ADD COLUMN "selectionExitAt" TIMESTAMP(3),
ADD COLUMN "selectionExitReason" TEXT,
ADD COLUMN "selectionExitNotes" TEXT,
ADD COLUMN "selectionExitByStaffUserId" TEXT;
