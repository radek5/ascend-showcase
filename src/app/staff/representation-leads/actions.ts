"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

const ALLOWED_STATUSES = [
  "NOT_ELIGIBLE",
  "POTENTIAL",
  "REVIEW",
  "APPROVED",
  "DECLINED",
  "REPRESENTATION_DISCUSSION",
  "SIGNED",
] as const;

export async function updateRepresentationLead(
  formData: FormData,
) {
  const staffUser = await requireStaffUser();

  const registrationId = String(
    formData.get("registrationId") || "",
  ).trim();

  const prospectStatus = String(
    formData.get("prospectStatus") || "",
  ).trim();

  const notes = String(
    formData.get("notes") || "",
  ).trim();

  if (!registrationId) {
    throw new Error("Registration ID missing.");
  }

  if (
    !ALLOWED_STATUSES.includes(
      prospectStatus as
        (typeof ALLOWED_STATUSES)[number],
    )
  ) {
    throw new Error(
      "Invalid representation lead status.",
    );
  }

  const registration =
    await prisma.registration.findUnique({
      where: {
        id: registrationId,
      },
      include: {
        representationDeclaration: true,
      },
    });

  if (!registration) {
    throw new Error("Registration not found.");
  }

  await prisma.$transaction([
    prisma.registration.update({
      where: {
        id: registrationId,
      },
      data: {
        prospectStatus:
          prospectStatus as
            | "NOT_ELIGIBLE"
            | "POTENTIAL"
            | "REVIEW"
            | "APPROVED"
            | "DECLINED"
            | "REPRESENTATION_DISCUSSION"
            | "SIGNED",
      },
    }),

    prisma.representationDeclaration.update({
      where: {
        registrationId,
      },
      data: {
        notes:
          notes ||
          registration.representationDeclaration
            ?.notes ||
          null,
      },
    }),
  ]);

  console.log("Representation lead updated", {
    registrationId,
    prospectStatus,
    changedBy: staffUser.email,
  });

  revalidatePath(
    "/staff/representation-leads",
  );

  revalidatePath(
    `/staff/registrations/${registrationId}`,
  );

  revalidatePath("/staff/dashboard");
}
