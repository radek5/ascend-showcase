"use server";

import { redirect } from "next/navigation";

import { createSecureToken, hashSecureToken } from "@/lib/applicants/tokens";
import { sendApplicantPasswordResetEmail } from "@/lib/email/sendApplicantPasswordResetEmail";
import { prisma } from "@/lib/prisma";

export async function requestApplicantPasswordReset(formData: FormData) {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  /*
   * Always return the same public result.
   *
   * This prevents the password-reset flow from
   * revealing whether an applicant account exists.
   */
  const successRedirect = `/account/forgot-password?sent=1&email=${encodeURIComponent(
    email,
  )}`;

  if (!email) {
    redirect(successRedirect);
  }

  const applicantUser = await prisma.applicantUser.findUnique({
    where: {
      email,
    },
  });

  if (!applicantUser) {
    redirect(successRedirect);
  }

  const rawToken = createSecureToken();
  const tokenHash = hashSecureToken(rawToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    await tx.applicantPasswordResetToken.updateMany({
      where: {
        userId: applicantUser.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    await tx.applicantPasswordResetToken.create({
      data: {
        userId: applicantUser.id,
        tokenHash,
        expiresAt,
      },
    });
  });

  try {
    await sendApplicantPasswordResetEmail({
      email: applicantUser.email,
      token: rawToken,
    });
  } catch (error) {
    console.error("Applicant password reset email failed:", error);
  }

  redirect(successRedirect);
}
