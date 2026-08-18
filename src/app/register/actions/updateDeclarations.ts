"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAgeAtEvent } from "@/lib/registration/ageAtEvent";

export async function updateDeclarations(formData: FormData) {
  const registrationId = String(
    formData.get("registrationId") || "",
  );

  if (!registrationId) {
    throw new Error("Registration ID missing.");
  }

  const registration = await prisma.registration.findUnique({
    where: {
      id: registrationId,
    },
    include: {
      event: true,
    },
  });

  if (!registration) {
    throw new Error("Registration not found.");
  }

  const { isUnder18AtEvent } = getAgeAtEvent(
    registration.dateOfBirth,
    registration.event.footballStartsAt,
  );

  if (isUnder18AtEvent === null) {
    throw new Error(
      "Unable to determine the player's age at the event.",
    );
  }

  if (
    isUnder18AtEvent &&
    (!registration.guardianName ||
      !registration.guardianRelationship)
  ) {
    throw new Error(
      "Parent or guardian details are required.",
    );
  }

  const eventConsent =
    formData.get("eventConsent") === "on";

  const declarationConsent =
    formData.get("declarationConsent") === "on";

  const termsConsent =
    formData.get("termsConsent") === "on";

  const privacyConsent =
    formData.get("privacyConsent") === "on";

  const playerAgreementConsent =
    formData.get("playerAgreementConsent") === "on";

  const futureEventConsent =
    formData.get("futureEventConsent") === "on";

  if (
    !eventConsent ||
    !declarationConsent ||
    !termsConsent ||
    !privacyConsent ||
    !playerAgreementConsent
  ) {

    throw new Error(
      "Please complete all required declarations.",
    );
  }

  await prisma.registration.update({
    where: {
      id: registrationId,
    },
    data: {
      eventConsent,
      declarationConsent,
      termsConsent,
      privacyConsent,
      playerAgreementConsent,
 
      futureEventConsent,
      futureEventConsentAt:
        futureEventConsent ? new Date() : null,    

      currentStep: "PRIVACY_MEDIA",
    },
  });

  redirect(
    `/register/media-publicity?registration=${registrationId}`,
  );
}
