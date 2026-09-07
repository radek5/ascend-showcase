"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { deleteApplicantSession } from "@/lib/applicants/session";
import { hashSecureToken } from "@/lib/applicants/tokens";
import { prisma } from "@/lib/prisma";

function resetError(token: string, message: string) {
  return `/account/reset-password?token=${encodeURIComponent(
    token,
  )}&error=${encodeURIComponent(message)}`;
}

export async function resetApplicantPassword(formData: FormData) {
  const token = String(formData.get("token") || "").trim();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!token) {
    redirect("/account/reset-password?invalid=1");
  }

  if (password.length < 10) {
    redirect(
      resetError(token, "Your password must contain at least 10 characters."),
    );
  }

  if (!/[A-Z]/.test(password)) {
    redirect(
      resetError(
        token,
        "Your password must contain at least one uppercase letter.",
      ),
    );
  }

  if (!/[a-z]/.test(password)) {
    redirect(
      resetError(
        token,
        "Your password must contain at least one lowercase letter.",
      ),
    );
  }

  if (!/[0-9]/.test(password)) {
    redirect(
      resetError(token, "Your password must contain at least one number."),
    );
  }

  if (password !== confirmPassword) {
    redirect(resetError(token, "The passwords you entered do not match."));
  }

  const tokenHash = hashSecureToken(token);
  const now = new Date();

  const resetToken = await prisma.applicantPasswordResetToken.findUnique({
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

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= now) {
    redirect("/account/reset-password?invalid=1");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const updated = await prisma.$transaction(async (tx) => {
    const consumed = await tx.applicantPasswordResetToken.updateMany({
      where: {
        id: resetToken.id,
        usedAt: null,
        expiresAt: {
          gt: now,
        },
      },
      data: {
        usedAt: now,
      },
    });

    if (consumed.count !== 1) {
      return false;
    }

    await tx.applicantUser.update({
      where: {
        id: resetToken.userId,
      },
      data: {
        passwordHash,
      },
    });

    await tx.applicantPasswordResetToken.updateMany({
      where: {
        userId: resetToken.userId,
        usedAt: null,
      },
      data: {
        usedAt: now,
      },
    });

    return true;
  });

  if (!updated) {
    redirect("/account/reset-password?invalid=1");
  }

  /*
   * Remove any session currently present in this browser.
   * The applicant must authenticate again with the new password.
   */
  await deleteApplicantSession();

  redirect("/account/login?reset=success");
}
