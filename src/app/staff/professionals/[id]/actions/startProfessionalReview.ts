"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

export async function startProfessionalReview(
  formData: FormData,
) {
  await requireStaffUser();

  const registrationId = String(
    formData.get("registrationId") || "",
  ).trim();

  if (!registrationId) {
    throw new Error(
      "Professional registration ID missing.",
    );
  }

  const transition =
    await prisma.professionalRegistration.updateMany({
      where: {
        id: registrationId,
        status: "SUBMITTED",
        archivedAt: null,
      },
      data: {
        status: "UNDER_REVIEW",
      },
    });

  if (transition.count !== 1) {
    throw new Error(
      "This professional registration is not available to start review.",
    );
  }

  revalidatePath("/staff/professionals");
  revalidatePath(
    `/staff/professionals/${registrationId}`,
  );
  revalidatePath("/staff/dashboard");
}
