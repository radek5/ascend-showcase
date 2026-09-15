"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  checkApplicantApplicationAccess,
  getApplicantApplicationAccessError,
} from "@/lib/applicants/applicationOwnership";
import { prisma } from "@/lib/prisma";

const KIT_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;

function requiredText(formData: FormData, name: string, label: string) {
  const value = String(formData.get(name) ?? "").trim();

  if (!value) {
    throw new Error(`${label} is required.`);
  }

  return value;
}

function optionalText(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim() || null;
}

function requiredBoolean(formData: FormData, name: string, label: string) {
  const value = String(formData.get(name) ?? "");

  if (value === "yes") {
    return true;
  }

  if (value === "no") {
    return false;
  }

  throw new Error(`${label} must be answered.`);
}

export async function updateSelectedPlayerConfirmation(formData: FormData) {
  const applicationId = String(formData.get("applicationId") ?? "").trim();

  if (!applicationId) {
    throw new Error("Application ID is required.");
  }

  const access = await checkApplicantApplicationAccess(applicationId);

  if (!access.authorised) {
    const accessError = getApplicantApplicationAccessError(access);

    if (accessError.status === 401) {
      redirect("/apply/lagos-2027/account/login");
    }

    throw new Error(accessError.error);
  }

  const application = await prisma.showcaseApplication.findUnique({
    where: {
      id: access.applicationId,
    },

    select: {
      id: true,
      eventSlug: true,
      status: true,
      selectionDecisionReleasedAt: true,
      selectionResponse: true,
    },
  });

  if (!application) {
    throw new Error("Showcase application not found.");
  }

  const event = await prisma.event.findUnique({
    where: {
      slug: application.eventSlug,
    },

    select: {
      selectionDecisionsReleasedAt: true,
    },
  });

  if (!event) {
    throw new Error("Showcase event not found.");
  }

  if (
    !event.selectionDecisionsReleasedAt ||
    !application.selectionDecisionReleasedAt
  ) {
    throw new Error(
      "The selection decision has not yet been formally released.",
    );
  }

  if (application.status !== "SELECTED") {
    throw new Error(
      "Selected Player Confirmation is only available to selected players.",
    );
  }

  if (application.selectionResponse !== "ACCEPTED") {
    throw new Error(
      "You must accept your Lagos 2027 place before completing this confirmation.",
    );
  }

  const attendanceConfirmed = formData.get("attendanceConfirmed") === "on";

  if (!attendanceConfirmed) {
    throw new Error("You must confirm that you intend to attend Lagos 2027.");
  }

  const shirtSize = requiredText(formData, "shirtSize", "Shirt size");

  const shortsSize = requiredText(formData, "shortsSize", "Shorts size");

  if (
    !KIT_SIZES.includes(shirtSize as (typeof KIT_SIZES)[number]) ||
    !KIT_SIZES.includes(shortsSize as (typeof KIT_SIZES)[number])
  ) {
    throw new Error("A valid kit size is required.");
  }

  const sockSize = optionalText(formData, "sockSize");

  const emergencyContactName = requiredText(
    formData,
    "emergencyContactName",
    "Emergency contact name",
  );

  const emergencyContactRelationship = requiredText(
    formData,
    "emergencyContactRelationship",
    "Emergency contact relationship",
  );

  const emergencyContactPhone = requiredText(
    formData,
    "emergencyContactPhone",
    "Emergency contact phone",
  );

  const hasDietaryRequirements = requiredBoolean(
    formData,
    "hasDietaryRequirements",
    "Dietary requirements",
  );

  const hasMedicalUpdate = requiredBoolean(
    formData,
    "hasMedicalUpdate",
    "Medical update",
  );

  const hasAccessibilityNeeds = requiredBoolean(
    formData,
    "hasAccessibilityNeeds",
    "Accessibility or support requirements",
  );

  const dietaryRequirements = optionalText(formData, "dietaryRequirements");

  const medicalUpdate = optionalText(formData, "medicalUpdate");

  const accessibilityNeeds = optionalText(formData, "accessibilityNeeds");

  const otherRequirements = optionalText(formData, "otherRequirements");

  if (hasDietaryRequirements && !dietaryRequirements) {
    throw new Error("Please provide details of your dietary requirements.");
  }

  if (hasMedicalUpdate && !medicalUpdate) {
    throw new Error("Please provide details of your medical update.");
  }

  if (hasAccessibilityNeeds && !accessibilityNeeds) {
    throw new Error(
      "Please provide details of your accessibility or support requirements.",
    );
  }

  const informationConfirmed = formData.get("informationConfirmed") === "on";

  if (!informationConfirmed) {
    throw new Error(
      "You must confirm that the information provided is accurate and current.",
    );
  }

  const confirmedAt = new Date();

  await prisma.showcaseSelectedPlayerConfirmation.upsert({
    where: {
      applicationId: application.id,
    },

    create: {
      applicationId: application.id,

      attendanceConfirmed,

      shirtSize: shirtSize as (typeof KIT_SIZES)[number],
      shortsSize: shortsSize as (typeof KIT_SIZES)[number],
      sockSize,

      emergencyContactName,
      emergencyContactRelationship,
      emergencyContactPhone,

      hasDietaryRequirements,
      dietaryRequirements: hasDietaryRequirements ? dietaryRequirements : null,

      hasMedicalUpdate,
      medicalUpdate: hasMedicalUpdate ? medicalUpdate : null,

      hasAccessibilityNeeds,
      accessibilityNeeds: hasAccessibilityNeeds ? accessibilityNeeds : null,

      otherRequirements,

      informationConfirmed,
      confirmedAt,
    },

    update: {
      attendanceConfirmed,

      shirtSize: shirtSize as (typeof KIT_SIZES)[number],
      shortsSize: shortsSize as (typeof KIT_SIZES)[number],
      sockSize,

      emergencyContactName,
      emergencyContactRelationship,
      emergencyContactPhone,

      hasDietaryRequirements,
      dietaryRequirements: hasDietaryRequirements ? dietaryRequirements : null,

      hasMedicalUpdate,
      medicalUpdate: hasMedicalUpdate ? medicalUpdate : null,

      hasAccessibilityNeeds,
      accessibilityNeeds: hasAccessibilityNeeds ? accessibilityNeeds : null,

      otherRequirements,

      informationConfirmed,
      confirmedAt,
    },
  });

  revalidatePath(
    `/apply/${application.eventSlug}/${application.id}/selected-player-confirmation`,
  );

  revalidatePath(
    `/apply/${application.eventSlug}/${application.id}/confirmation`,
  );

  revalidatePath("/account");

  redirect(`/apply/${application.eventSlug}/${application.id}/confirmation`);
}
