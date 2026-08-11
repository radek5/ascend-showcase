"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAgeAtEvent } from "@/lib/registration/ageAtEvent";

export async function updateMediaPublicity(formData: FormData) {
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
      "Unable to determine player age at event.",
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

  const mediaConsent =
    formData.get("mediaConsent") === "yes";

  await prisma.registration.update({
    where: {
      id: registrationId,
    },
    data: {
      mediaConsent,
      currentStep: "REVIEW",
    },
  });

  redirect(
    `/register/review?registration=${registrationId}`,
  );
}
