import "server-only";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getApplicantSession } from "./session";

export async function getCurrentApplicantUser() {
  const session = await getApplicantSession();

  if (!session) {
    return null;
  }

  const applicantUser = await prisma.applicantUser.findUnique({
    where: {
      id: session.applicantUserId,
    },
  });

  if (!applicantUser) {
    return null;
  }

  return applicantUser;
}

export async function requireApplicantUser() {
  const applicantUser = await getCurrentApplicantUser();

  if (!applicantUser) {
    redirect("/account/login");
  }

  return applicantUser;
}

export async function requireVerifiedApplicantUser() {
  const applicantUser = await requireApplicantUser();

  if (!applicantUser.emailVerifiedAt) {
    redirect(
      `/account/check-email?email=${encodeURIComponent(
        applicantUser.email,
      )}&verification=required`,
    );
  }

  return applicantUser;
}
