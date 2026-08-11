"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAgeAtEvent } from "@/lib/registration/ageAtEvent";

export async function updateMedicalConsent(formData: FormData) {
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

  const medicalNotes = String(
    formData.get("medicalNotes") || "",
  ).trim();

  const emergencyContactName = String(
    formData.get("emergencyContactName") || "",
  ).trim();

  const emergencyContactPhone = String(
    formData.get("emergencyContactPhone") || "",
  ).trim();

  const medicalConsent =
    formData.get("medicalConsent") === "on";

  if (!emergencyContactName || !emergencyContactPhone) {
    throw new Error(
      "Emergency contact details are required.",
    );
  }

  if (!medicalConsent) {
    throw new Error(
      isUnder18AtEvent
        ? "Parent or guardian medical consent is required."
        : "Medical consent is required.",
    );
  }

  if (isUnder18AtEvent) {
    if (
      !registration.guardianName ||
      !registration.guardianRelationship ||
      !registration.guardianEmail ||
      !registration.guardianPhone
    ) {
      throw new Error(
        "Parent or guardian details are required before medical consent can be completed.",
      );
    }
  }

  await prisma.registration.update({
    where: {
      id: registrationId,
    },
    data: {
      medicalNotes: medicalNotes || null,

      emergencyContactName,
      emergencyContactPhone,

      medicalConsent,

      currentStep: "DECLARATIONS",
    },
  });

  redirect(
    `/register/declarations?registration=${registrationId}`,
  );
}
