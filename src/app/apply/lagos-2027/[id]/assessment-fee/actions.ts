"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  getApplicationPaymentReadiness,
} from "@/lib/showcase/getApplicationPaymentReadiness";

export async function acceptAssessmentFeeTerms(
  formData: FormData
) {
  const applicationId = String(
    formData.get("applicationId") || ""
  ).trim();

  const accepted =
    formData.get(
      "assessmentDisclaimerAccepted"
    ) === "on";

  if (!applicationId) {
    throw new Error(
      "Application ID is required."
    );
  }

  if (!accepted) {
    throw new Error(
      "You must accept the assessment fee declaration before continuing."
    );
  }

  const application =
    await prisma.showcaseApplication.findUnique({
      where: {
        id: applicationId,
      },

      select: {
        id: true,
        eventSlug: true,

        assessmentFeePaid: true,

        assessmentDisclaimerAccepted: true,
        assessmentDisclaimerAcceptedAt: true,
      },
    });

  if (!application) {
    throw new Error(
      "Application not found."
    );
  }

  /*
   * A completed payment must never be moved
   * backwards into the fee/payment workflow.
   */
  if (application.assessmentFeePaid) {
    redirect(
      `/apply/${application.eventSlug}/${application.id}/confirmation`
    );
  }

  /*
   * Server-side workflow protection.
   *
   * A player cannot enter the assessment-fee
   * / payment workflow until all mandatory
   * identity uploads and consent declarations
   * are complete.
   */
  const readiness =
    await getApplicationPaymentReadiness(
      application.id
    );

  if (!readiness) {
    throw new Error(
      "Application not found."
    );
  }

  if (!readiness.ready) {
    redirect(
      readiness.redirectPath ??
        `/apply/${application.eventSlug}/${application.id}/review`
    );
  }

  await prisma.showcaseApplication.update({
    where: {
      id: application.id,
    },

    data: {
      assessmentDisclaimerAccepted: true,

      assessmentDisclaimerAcceptedAt:
        application.assessmentDisclaimerAcceptedAt ??
        new Date(),

      status:
        "AWAITING_ASSESSMENT_FEE",
    },
  });

  redirect(
    `/apply/${application.eventSlug}/${application.id}/payment`
  );
}
