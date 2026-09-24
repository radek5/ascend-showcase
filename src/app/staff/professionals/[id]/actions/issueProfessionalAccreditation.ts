"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";
import { sendProfessionalAccreditation } from "@/lib/email/sendProfessionalAccreditation";

function generateCheckInToken() {
  return randomBytes(32).toString("hex");
}

function revalidateProfessionalAccreditation(
  registrationId: string,
) {
  revalidatePath("/staff/professionals");
  revalidatePath(
    `/staff/professionals/${registrationId}`,
  );
  revalidatePath("/staff/dashboard");
}

export async function issueProfessionalAccreditation(
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
        id: true,
        status: true,
        archivedAt: true,
        checkInToken: true,
      },
    });

  if (
    !registration ||
    registration.archivedAt ||
    registration.status !== "APPROVED"
  ) {
    throw new Error(
      "This professional registration is not available for Event Pass issuance.",
    );
  }

  if (
    registration.checkInToken
  ) {
    throw new Error(
      "This professional registration already has credential data.",
    );
  }

  const checkInToken = generateCheckInToken();

  const transition =
    await prisma.professionalRegistration.updateMany({
      where: {
        id: registrationId,
        status: "APPROVED",
        archivedAt: null,
        checkInToken: null,
      },
      data: {
        status: "ACCREDITED",
        checkInToken,
      },
    });

  if (transition.count !== 1) {
    throw new Error(
      "This professional registration is no longer available for Event Pass issuance.",
    );
  }

  revalidateProfessionalAccreditation(registrationId);

  try {
    await sendProfessionalAccreditation({
      registrationId,
    });
  } catch (error) {
    console.error(
      "Professional Event Pass issued, but email delivery failed.",
      {
        registrationId,
        error,
      },
    );
  }

  revalidateProfessionalAccreditation(registrationId);
}
