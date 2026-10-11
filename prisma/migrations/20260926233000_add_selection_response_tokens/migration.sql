CREATE TABLE "ShowcaseSelectionResponseToken" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShowcaseSelectionResponseToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ShowcaseSelectionResponseToken_tokenHash_key"
ON "ShowcaseSelectionResponseToken"("tokenHash");

CREATE INDEX "ShowcaseSelectionResponseToken_applicationId_idx"
ON "ShowcaseSelectionResponseToken"("applicationId");

CREATE INDEX "ShowcaseSelectionResponseToken_expiresAt_idx"
ON "ShowcaseSelectionResponseToken"("expiresAt");

ALTER TABLE "ShowcaseSelectionResponseToken"
ADD CONSTRAINT "ShowcaseSelectionResponseToken_applicationId_fkey"
FOREIGN KEY ("applicationId")
REFERENCES "ShowcaseApplication"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
