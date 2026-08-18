"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireStaffAdmin } from "@/lib/staff/auth";

export async function restorePlayer(formData: FormData) {
  await requireStaffAdmin();

  const id = String(formData.get("id") || "").trim();

  if (!id) {
    throw new Error("Player registration ID missing.");
  }

  await prisma.registration.update({
    where: { id },
    data: {
      archivedAt: null,
    },
  });

  revalidatePath("/staff/archive");
  revalidatePath("/staff/registrations");
  revalidatePath("/staff/people");
  revalidatePath("/staff/dashboard");
}

export async function restoreProfessional(formData: FormData) {
  await requireStaffAdmin();

  const id = String(formData.get("id") || "").trim();

  if (!id) {
    throw new Error("Professional registration ID missing.");
  }

  await prisma.professionalRegistration.update({
    where: { id },
    data: {
      archivedAt: null,
    },
  });

  revalidatePath("/staff/archive");
  revalidatePath("/staff/professionals");
  revalidatePath("/staff/people");
  revalidatePath("/staff/dashboard");
}
