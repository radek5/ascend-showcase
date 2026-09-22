"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

function getRegistrationId(formData: FormData) {
  const registrationId = String(
    formData.get("registrationId") || "",
  ).trim();

  if (!registrationId) {
    throw new Error(
      "Professional registration ID missing.",
    );
  }

  return registrationId;
}

function revalidateProfessionalReview(
  registrationId: string,
) {
  revalidatePath("/staff/professionals");
  revalidatePath(
    `/staff/professionals/${registrationId}`,
  );
  revalidatePath("/staff/dashboard");
}

export async function approveProfessional(
  formData: FormData,
) {
  await requireStaffUser();

  const registrationId = getRegistrationId(formData);
  const now = new Date();

  const transition =
    await prisma.professionalRegistration.updateMany({
      where: {
        id: registrationId,
        status: "UNDER_REVIEW",
        archivedAt: null,
      },
      data: {
        status: "APPROVED",
        approvedAt: now,
        rejectedAt: null,
      },
    });

  if (transition.count !== 1) {
    throw new Error(
      "This professional registration is not available for approval.",
    );
  }

  revalidateProfessionalReview(registrationId);
}

export async function rejectProfessional(
  formData: FormData,
) {
  await requireStaffUser();

  const registrationId = getRegistrationId(formData);
  const now = new Date();

  const transition =
    await prisma.professionalRegistration.updateMany({
      where: {
        id: registrationId,
        status: "UNDER_REVIEW",
        archivedAt: null,
      },
      data: {
        status: "REJECTED",
        rejectedAt: now,
        approvedAt: null,
      },
    });

  if (transition.count !== 1) {
    throw new Error(
      "This professional registration is not available for rejection.",
    );
  }

  revalidateProfessionalReview(registrationId);
}
