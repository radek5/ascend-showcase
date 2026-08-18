"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireStaffAdmin } from "@/lib/staff/auth";

export async function archiveProfessional(
  formData: FormData,
) {
  await requireStaffAdmin();

  const registrationId = String(
    formData.get("registrationId") || "",
  );

  if (!registrationId) {
    throw new Error(
      "Professional registration ID missing.",
    );
  }

  const registration =
    await prisma.professionalRegistration.findUnique({
      where: {
        id: registrationId,
      },
      select: {
        id: true,
        archivedAt: true,
      },
    });

  if (!registration) {
    throw new Error(
      "Professional registration not found.",
    );
  }

  if (registration.archivedAt) {
    return;
  }

  await prisma.professionalRegistration.update({
    where: {
      id: registrationId,
    },

    data: {
      archivedAt: new Date(),
    },
  });

  revalidatePath("/staff/professionals");
  revalidatePath("/staff/people");
  revalidatePath("/staff/dashboard");
}
