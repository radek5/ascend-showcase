"use server";

import { revalidatePath } from "next/cache";

import { sendProfessionalAccreditation } from "@/lib/email/sendProfessionalAccreditation";
import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

export async function resendProfessionalAccreditation(
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

  const registration =
    await prisma.professionalRegistration.findUnique({
      where: {
        id: registrationId,
      },
      select: {
        status: true,
        archivedAt: true,
        accreditationNumber: true,
        checkInToken: true,
        approvalEmailSentAt: true,
      },
    });

  if (
    !registration ||
    registration.archivedAt ||
    registration.status !== "ACCREDITED"
  ) {
    throw new Error(
      "This professional registration is not available for accreditation email delivery.",
    );
  }

  if (
    !registration.accreditationNumber ||
    !registration.checkInToken
  ) {
    throw new Error(
      "Professional accreditation credentials are incomplete.",
    );
  }

  if (registration.approvalEmailSentAt) {
    throw new Error(
      "The professional accreditation email has already been sent.",
    );
  }

  await sendProfessionalAccreditation({
    registrationId,
  });

  revalidatePath("/staff/professionals");
  revalidatePath(
    `/staff/professionals/${registrationId}`,
  );
  revalidatePath("/staff/dashboard");
}
