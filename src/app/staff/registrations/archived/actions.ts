"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireStaffAdmin } from "@/lib/staff/auth";

export async function restoreRegistration(
  formData: FormData,
) {
  await requireStaffAdmin();

  const registrationId = String(
    formData.get("registrationId") || "",
  ).trim();

  if (!registrationId) {
    throw new Error("Registration ID missing.");
  }

  await prisma.registration.update({
    where: {
      id: registrationId,
    },
    data: {
      archivedAt: null,
    },
  });

  revalidatePath("/staff/registrations");
  revalidatePath("/staff/registrations/archived");
  revalidatePath("/staff/dashboard");
}
