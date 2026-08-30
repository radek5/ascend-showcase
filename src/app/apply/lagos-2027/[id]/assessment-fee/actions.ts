"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

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
      },
    });

  if (!application) {
    throw new Error(
      "Application not found."
    );
  }

  await prisma.showcaseApplication.update({
    where: {
      id: application.id,
    },

    data: {
      assessmentDisclaimerAccepted: true,
      assessmentDisclaimerAcceptedAt:
        new Date(),

      status:
        "AWAITING_ASSESSMENT_FEE",
    },
  });

  redirect(
    `/apply/${application.eventSlug}/${application.id}/payment`
  );
}
