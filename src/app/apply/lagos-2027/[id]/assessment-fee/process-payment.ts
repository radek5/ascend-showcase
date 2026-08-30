"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

import {
  allocateApplicationIdentity,
} from "@/lib/showcase/allocateApplicationIdentity";

import {
  sendShowcaseApplicationConfirmation,
} from "@/lib/email/sendShowcaseApplicationConfirmation";

export async function processShowcaseMockPayment(
  formData: FormData
) {
  const applicationId = String(
    formData.get("applicationId") || ""
  ).trim();

  const currency = String(
    formData.get("currency") || "NGN"
  ).trim();

  const result = String(
    formData.get("result") || ""
  ).trim();

  if (!applicationId) {
    throw new Error(
      "Application ID is required."
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
        assessmentFeeRequired: true,

        assessmentDisclaimerAccepted:
          true,
      },
    });

  if (!application) {
    throw new Error(
      "Showcase application not found."
    );
  }

  if (
    application.assessmentFeeRequired &&
    !application.assessmentDisclaimerAccepted
  ) {
    redirect(
      `/apply/${application.eventSlug}/${application.id}/assessment-fee`
    );
  }

  /*
   * ----------------------------------------------------------
   * DECLINED MOCK PAYMENT
   * ----------------------------------------------------------
   */

  if (result === "decline") {
    redirect(
      `/apply/${application.eventSlug}/${application.id}/payment?payment=declined&currency=${encodeURIComponent(
        currency
      )}`
    );
  }

  if (result !== "success") {
    throw new Error(
      "Invalid payment result."
    );
  }

  /*
   * ----------------------------------------------------------
   * SUCCESSFUL MOCK PAYMENT
   * ----------------------------------------------------------
   *
   * Only record the payment once.
   */

  if (!application.assessmentFeePaid) {
    const reference =
      `ASCEND-ASSESS-${Date.now()}-${application.id
        .slice(-6)
        .toUpperCase()}`;

    await prisma.showcaseApplication.update({
      where: {
        id: application.id,
      },

      data: {
        assessmentFeePaid: true,
        assessmentFeePaidAt: new Date(),

        assessmentPaymentReference:
          reference,

        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });
  }

  /*
   * ----------------------------------------------------------
   * PERMANENT APPLICATION IDENTITY
   * ----------------------------------------------------------
   *
   * Both codes are allocated from the same sequence.
   *
   * Example:
   *
   * Player-facing:
   * ASC-LAG27-P-0042
   *
   * Anonymous selector-facing:
   * LAG27-0042
   *
   * These identities must never change because of
   * selection status.
   */

  await allocateApplicationIdentity({
    applicationId: application.id,
  });

  /*
   * ----------------------------------------------------------
   * APPLICATION CONFIRMATION EMAIL
   * ----------------------------------------------------------
   *
   * Email failure must not reverse a successful payment
   * or application submission.
   */

  try {
    await sendShowcaseApplicationConfirmation({
      applicationId: application.id,
    });
  } catch (error) {
    console.error(
      "Showcase application submitted but confirmation email failed:",
      error
    );
  }

  /*
   * ----------------------------------------------------------
   * CONFIRMATION
   * ----------------------------------------------------------
   */

  redirect(
    `/apply/${application.eventSlug}/${application.id}/confirmation`
  );
}
