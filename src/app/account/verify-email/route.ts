import { NextRequest, NextResponse } from "next/server";

import { createApplicantSession } from "@/lib/applicants/session";
import { hashSecureToken } from "@/lib/applicants/tokens";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim() || "";

  if (!token) {
    return NextResponse.redirect(
      new URL("/account/check-email?verification=invalid", request.url),
    );
  }

  const tokenHash = hashSecureToken(token);
  const now = new Date();

  const verificationToken = await prisma.applicantVerificationToken.findUnique({
    where: {
      tokenHash,
    },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      usedAt: true,
    },
  });

  if (
    !verificationToken ||
    verificationToken.usedAt ||
    verificationToken.expiresAt <= now
  ) {
    return NextResponse.redirect(
      new URL("/account/check-email?verification=invalid", request.url),
    );
  }

  const verifiedAt = new Date();

  const consumed = await prisma.applicantVerificationToken.updateMany({
    where: {
      id: verificationToken.id,
      usedAt: null,
      expiresAt: {
        gt: verifiedAt,
      },
    },
    data: {
      usedAt: verifiedAt,
    },
  });

  if (consumed.count !== 1) {
    return NextResponse.redirect(
      new URL("/account/check-email?verification=invalid", request.url),
    );
  }

  await prisma.applicantUser.update({
    where: {
      id: verificationToken.userId,
    },
    data: {
      emailVerifiedAt: verifiedAt,
    },
  });

  await createApplicantSession({
    applicantUserId: verificationToken.userId,
  });

  return NextResponse.redirect(new URL("/account?verified=1", request.url));
}
