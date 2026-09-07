"use server";

import { redirect } from "next/navigation";

import { requireApplicantUser } from "@/lib/applicants/auth";
import { createSecureToken, hashSecureToken } from "@/lib/applicants/tokens";
import { sendApplicantVerificationEmail } from "@/lib/email/sendApplicantVerificationEmail";
import { prisma } from "@/lib/prisma";

export async function resendApplicantVerificationEmail() {
  const applicantUser = await requireApplicantUser();

  if (applicantUser.emailVerifiedAt) {
    redirect("/account");
  }

  const rawToken = createSecureToken();
  const tokenHash = hashSecureToken(rawToken);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    /*
     * Invalidate any outstanding verification links.
     * Only the newly generated link should remain usable.
     */
    await tx.applicantVerificationToken.updateMany({
      where: {
        userId: applicantUser.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    await tx.applicantVerificationToken.create({
      data: {
        userId: applicantUser.id,
        tokenHash,
        expiresAt,
      },
    });
  });

  try {
    await sendApplicantVerificationEmail({
      email: applicantUser.email,
      token: rawToken,
    });
  } catch (error) {
    console.error("Applicant verification email resend failed:", error);

    redirect(
      `/account/check-email?email=${encodeURIComponent(
        applicantUser.email,
      )}&delivery=failed`,
    );
  }

  redirect(
    `/account/check-email?email=${encodeURIComponent(
      applicantUser.email,
    )}&verification=required&resent=1`,
  );
}
