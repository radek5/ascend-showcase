"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

function checked(
  formData: FormData,
  name: string
) {
  return formData.get(name) === "on";
}

export async function updateShowcaseConsent(
  formData: FormData
) {
  const applicationId = String(
    formData.get("applicationId") ?? ""
  );

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
      },
    });

  if (!application) {
    throw new Error(
      "Showcase application not found."
    );
  }

  const medicalNotes =
    String(
      formData.get("medicalNotes") ?? ""
    ).trim() || null;

  const medicalConsent =
    checked(formData, "medicalConsent");

  const eventConsent =
    checked(formData, "eventConsent");

  const declarationConsent =
    checked(
      formData,
      "declarationConsent"
    );

  const termsConsent =
    checked(formData, "termsConsent");

  const privacyConsent =
    checked(formData, "privacyConsent");

  const playerAgreementConsent =
    checked(
      formData,
      "playerAgreementConsent"
    );

  const futureEventConsent =
    checked(
      formData,
      "futureEventConsent"
    );

  /*
   * Required declarations are also
   * validated server-side.
   */
  if (
    !medicalConsent ||
    !eventConsent ||
    !declarationConsent ||
    !termsConsent ||
    !privacyConsent ||
    !playerAgreementConsent
  ) {
    throw new Error(
      "All required consent and declaration items must be accepted."
    );
  }

  await prisma.showcaseApplication.update({
    where: {
      id: application.id,
    },

    data: {
      medicalNotes,
      medicalConsent,
      eventConsent,
      declarationConsent,
      termsConsent,
      privacyConsent,
      playerAgreementConsent,

      futureEventConsent,

      futureEventConsentAt:
        futureEventConsent
          ? new Date()
          : null,
    },
  });

  redirect(
    `/apply/${application.eventSlug}/${application.id}/review`
  );
}
