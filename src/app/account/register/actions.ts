"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { createSecureToken, hashSecureToken } from "@/lib/applicants/tokens";
import { sendApplicantVerificationEmail } from "@/lib/email/sendApplicantVerificationEmail";
import { prisma } from "@/lib/prisma";

function registerError(message: string) {
  return `/account/register?error=${encodeURIComponent(message)}`;
}

export async function registerApplicant(formData: FormData) {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!email || !password || !confirmPassword) {
    redirect(registerError("Please enter your email address and password."));
  }

  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!emailLooksValid) {
    redirect(registerError("Please enter a valid email address."));
  }

  if (password.length < 10) {
    redirect(
      registerError("Your password must contain at least 10 characters."),
    );
  }

  if (!/[A-Z]/.test(password)) {
    redirect(
      registerError(
        "Your password must contain at least one uppercase letter.",
      ),
    );
  }

  if (!/[a-z]/.test(password)) {
    redirect(
      registerError(
        "Your password must contain at least one lowercase letter.",
      ),
    );
  }

  if (!/[0-9]/.test(password)) {
    redirect(registerError("Your password must contain at least one number."));
  }

  if (password !== confirmPassword) {
    redirect(registerError("The passwords you entered do not match."));
  }

  const existingUser = await prisma.applicantUser.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    redirect(
      registerError(
        "An account already exists for this email address. Please sign in or reset your password.",
      ),
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const rawToken = createSecureToken();
  const tokenHash = hashSecureToken(rawToken);

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const applicantUser = await prisma.$transaction(async (tx) => {
    const user = await tx.applicantUser.create({
      data: {
        email,
        passwordHash,
      },
    });

    await tx.applicantVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return user;
  });

  try {
    await sendApplicantVerificationEmail({
      email: applicantUser.email,
      token: rawToken,
    });
  } catch (error) {
    console.error("Applicant verification email failed:", error);

    /*
     * Keep the account and verification token.
     *
     * A resend-verification flow will allow the
     * applicant to request another email without
     * recreating the account.
     */

    redirect(
      `/account/check-email?email=${encodeURIComponent(
        applicantUser.email,
      )}&delivery=failed`,
    );
  }

  redirect(
    `/account/check-email?email=${encodeURIComponent(applicantUser.email)}`,
  );
}
