ALTER TABLE "ShowcaseSelectedPlayer"
ADD COLUMN "listStatus" TEXT NOT NULL DEFAULT 'PRE_SELECTED';

ALTER TABLE "ShowcaseSelectedPlayer"
ADD CONSTRAINT "ShowcaseSelectedPlayer_listStatus_check"
CHECK ("listStatus" IN ('PRE_SELECTED', 'STANDBY', 'REMOVED'));
