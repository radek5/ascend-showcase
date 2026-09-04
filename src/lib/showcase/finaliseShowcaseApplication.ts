import { prisma } from "@/lib/prisma";

import { sendShowcaseApplicationConfirmation } from "@/lib/email/sendShowcaseApplicationConfirmation";
import { allocateApplicationIdentity } from "@/lib/showcase/allocateApplicationIdentity";
import { getApplicationSubmissionReadiness } from "@/lib/showcase/getApplicationSubmissionReadiness";

type FinaliseShowcaseApplicationArgs = {
  applicationId: string;
};

export async function finaliseShowcaseApplication({
  applicationId,
}: FinaliseShowcaseApplicationArgs) {
  /*
   * ----------------------------------------------------------
   * LOAD CURRENT SUBMISSION STATE
   * ----------------------------------------------------------
   */

  const application = await prisma.showcaseApplication.findUnique({
    where: {
      id: applicationId,
    },

    select: {
      id: true,
      eventSlug: true,
      status: true,
      submittedAt: true,
    },
  });

  if (!application) {
    throw new Error("Showcase application not found.");
  }

  /*
   * ----------------------------------------------------------
   * SUBMISSION READINESS
   * ----------------------------------------------------------
   *
   * Submission is independent of payment.
   *
   * Every application must satisfy the core
   * player, contact, identity, football disclosure,
   * video and consent requirements before it can
   * enter the assessment workflow.
   */

  const readiness = await getApplicationSubmissionReadiness(application.id);

  if (!readiness) {
    throw new Error("Showcase application not found.");
  }

  if (!readiness.ready) {
    return {
      success: false as const,
      alreadySubmitted: false,
      applicationId: application.id,
      eventSlug: application.eventSlug,
      redirectPath:
        readiness.redirectPath ??
        `/apply/${application.eventSlug}/${application.id}/review`,
    };
  }

  /*
   * ----------------------------------------------------------
   * FINALISE APPLICATION
   * ----------------------------------------------------------
   *
   * Preserve the original submission timestamp.
   * Repeated calls must not move the application
   * backwards or create a new submission date.
   */

  if (application.status !== "SUBMITTED" || !application.submittedAt) {
    await prisma.showcaseApplication.update({
      where: {
        id: application.id,
      },

      data: {
        status: "SUBMITTED",

        submittedAt: application.submittedAt ?? new Date(),
      },
    });
  }

  /*
   * ----------------------------------------------------------
   * PERMANENT APPLICATION IDENTITY
   * ----------------------------------------------------------
   *
   * Allocation is already designed to preserve an
   * existing registration number, assessment code
   * and check-in token.
   */

  const identity = await allocateApplicationIdentity({
    applicationId: application.id,
  });

  /*
   * ----------------------------------------------------------
   * CONFIRMATION EMAIL
   * ----------------------------------------------------------
   *
   * Email failure must never reverse a completed
   * application submission.
   *
   * The email helper is independently idempotent
   * through confirmationEmailSentAt.
   */

  try {
    await sendShowcaseApplicationConfirmation({
      applicationId: application.id,
    });
  } catch (error) {
    console.error(
      "Showcase application submitted but confirmation email failed:",
      error,
    );
  }

  return {
    success: true as const,

    alreadySubmitted:
      application.status === "SUBMITTED" && Boolean(application.submittedAt),

    applicationId: application.id,
    eventSlug: application.eventSlug,

    registrationNumber: identity.registrationNumber,

    assessmentCode: identity.assessmentCode,

    checkInToken: identity.checkInToken,
  };
}
