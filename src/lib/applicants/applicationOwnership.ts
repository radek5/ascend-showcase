import "server-only";

import { prisma } from "@/lib/prisma";

import { getCurrentApplicantUser } from "./auth";

export type ApplicantApplicationAccessResult =
  | {
      authorised: true;
      applicantUserId: string;
      applicationId: string;
      submittedAt: Date | null;
    }
  | {
      authorised: false;
      reason:
        "UNAUTHENTICATED" | "EMAIL_NOT_VERIFIED" | "APPLICATION_NOT_FOUND";
    };

export async function checkApplicantApplicationAccess(
  applicationId: string,
): Promise<ApplicantApplicationAccessResult> {
  const applicantUser = await getCurrentApplicantUser();

  if (!applicantUser) {
    return {
      authorised: false,
      reason: "UNAUTHENTICATED",
    };
  }

  if (!applicantUser.emailVerifiedAt) {
    return {
      authorised: false,
      reason: "EMAIL_NOT_VERIFIED",
    };
  }

  const application = await prisma.showcaseApplication.findFirst({
    where: {
      id: applicationId,
      userId: applicantUser.id,
    },

    select: {
      id: true,
      submittedAt: true,
    },
  });

  if (!application) {
    return {
      authorised: false,
      reason: "APPLICATION_NOT_FOUND",
    };
  }

  return {
    authorised: true,
    applicantUserId: applicantUser.id,
    applicationId: application.id,
    submittedAt: application.submittedAt,
  };
}

export function getApplicantApplicationAccessError(
  result: Extract<ApplicantApplicationAccessResult, { authorised: false }>,
) {
  if (result.reason === "UNAUTHENTICATED") {
    return {
      error: "Please sign in to continue.",
      code: "APPLICANT_AUTH_REQUIRED",
      status: 401,
    };
  }

  if (result.reason === "EMAIL_NOT_VERIFIED") {
    return {
      error: "Please verify your email address to continue.",
      code: "APPLICANT_EMAIL_VERIFICATION_REQUIRED",
      status: 403,
    };
  }

  return {
    error: "Application not found.",
    code: "APPLICATION_NOT_FOUND",
    status: 404,
  };
}
