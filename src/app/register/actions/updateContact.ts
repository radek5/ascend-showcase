"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAgeAtEvent } from "@/lib/registration/ageAtEvent";

export async function updateContact(formData: FormData) {
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

  const email = String(
    formData.get("email") || "",
  ).trim();

  const phone = String(
    formData.get("phone") || "",
  ).trim();

  const guardianName = String(
    formData.get("guardianName") || "",
  ).trim();

  const guardianRelationship = String(
    formData.get("guardianRelationship") || "",
  ).trim();

  const guardianEmail = String(
    formData.get("guardianEmail") || "",
  ).trim();

  const guardianPhone = String(
    formData.get("guardianPhone") || "",
  ).trim();

  if (isUnder18AtEvent) {
    if (
      !guardianName ||
      !guardianRelationship ||
      !guardianEmail ||
      !guardianPhone
    ) {
      throw new Error(
        "Parent or guardian contact details are required for players under 18.",
      );
    }
  } else {
    if (!email || !phone) {
      throw new Error(
        "Player contact details are required.",
      );
    }
  }

  await prisma.registration.update({
    where: {
      id: registrationId,
    },
    data: {
      // 18+ players are contacted directly.
      email: isUnder18AtEvent ? null : email,
      phone: isUnder18AtEvent ? null : phone,

      // U18 players are contacted only through parent/guardian.
      guardianName: isUnder18AtEvent
        ? guardianName
        : null,

      guardianRelationship: isUnder18AtEvent
        ? guardianRelationship
        : null,

      guardianEmail: isUnder18AtEvent
        ? guardianEmail
        : null,

      guardianPhone: isUnder18AtEvent
        ? guardianPhone
        : null,

      currentStep: "REPRESENTATION",
    },
  });

  redirect(
    `/register/representation?registration=${registrationId}`,
  );
}
