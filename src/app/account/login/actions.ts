"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { createApplicantSession } from "@/lib/applicants/session";
import { prisma } from "@/lib/prisma";

function loginError(message: string) {
  return `/account/login?error=${encodeURIComponent(message)}`;
}

export async function applicantLogin(formData: FormData) {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  const password = String(formData.get("password") || "");

  if (!email || !password) {
    redirect(loginError("Please enter your email address and password."));
  }

  const applicantUser = await prisma.applicantUser.findUnique({
    where: {
      email,
    },
  });

  if (!applicantUser) {
    redirect(loginError("Invalid email address or password."));
  }

  const passwordMatches = await bcrypt.compare(
    password,
    applicantUser.passwordHash,
  );

  if (!passwordMatches) {
    redirect(loginError("Invalid email address or password."));
  }

  /*
   * We only reveal verification status after the
   * applicant has proved knowledge of the password.
   */
  if (!applicantUser.emailVerifiedAt) {
    await createApplicantSession({
      applicantUserId: applicantUser.id,
    });

    redirect(
      `/account/check-email?email=${encodeURIComponent(
        applicantUser.email,
      )}&verification=required`,
    );
  }

  await prisma.applicantUser.update({
    where: {
      id: applicantUser.id,
    },
    data: {
      lastLoginAt: new Date(),
    },
  });

  await createApplicantSession({
    applicantUserId: applicantUser.id,
  });

  redirect("/account");
}
