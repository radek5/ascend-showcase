-- CreateTable
CREATE TABLE "ApplicantUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "emailVerifiedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantVerificationToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicantVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantPasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicantPasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantUser_email_key" ON "ApplicantUser"("email");

-- CreateIndex
CREATE INDEX "ApplicantUser_emailVerifiedAt_idx" ON "ApplicantUser"("emailVerifiedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantVerificationToken_tokenHash_key" ON "ApplicantVerificationToken"("tokenHash");

-- CreateIndex
CREATE INDEX "ApplicantVerificationToken_userId_idx" ON "ApplicantVerificationToken"("userId");

-- CreateIndex
CREATE INDEX "ApplicantVerificationToken_expiresAt_idx" ON "ApplicantVerificationToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantPasswordResetToken_tokenHash_key" ON "ApplicantPasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "ApplicantPasswordResetToken_userId_idx" ON "ApplicantPasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "ApplicantPasswordResetToken_expiresAt_idx" ON "ApplicantPasswordResetToken"("expiresAt");

-- CreateIndex
CREATE INDEX "ShowcaseApplication_userId_idx" ON "ShowcaseApplication"("userId");

-- AddForeignKey
ALTER TABLE "ShowcaseApplication" ADD CONSTRAINT "ShowcaseApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ApplicantUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantVerificationToken" ADD CONSTRAINT "ApplicantVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ApplicantUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantPasswordResetToken" ADD CONSTRAINT "ApplicantPasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ApplicantUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
