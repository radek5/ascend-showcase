"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";
import { sendProfessionalAccreditation } from "@/lib/email/sendProfessionalAccreditation";

function generateAccreditationNumber() {
  return `RX1-LAG27-PR-${randomBytes(6)
    .toString("hex")
    .toUpperCase()}`;
}

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
        accreditationNumber: true,
        checkInToken: true,
      },
    });

  if (
    !registration ||
    registration.archivedAt ||
    registration.status !== "APPROVED"
  ) {
    throw new Error(
      "This professional registration is not available for accreditation.",
    );
  }

  if (
    registration.accreditationNumber ||
    registration.checkInToken
  ) {
    throw new Error(
      "This professional registration already has credential data.",
    );
  }

  const accreditationNumber =
    generateAccreditationNumber();
  const checkInToken = generateCheckInToken();

  const transition =
    await prisma.professionalRegistration.updateMany({
      where: {
        id: registrationId,
        status: "APPROVED",
        archivedAt: null,
        accreditationNumber: null,
        checkInToken: null,
      },
      data: {
        status: "ACCREDITED",
        accreditationNumber,
        checkInToken,
      },
    });

  if (transition.count !== 1) {
    throw new Error(
      "This professional registration is no longer available for accreditation.",
    );
  }

  revalidateProfessionalAccreditation(registrationId);

  try {
    await sendProfessionalAccreditation({
      registrationId,
    });
  } catch (error) {
    console.error(
      "Professional accreditation issued, but email delivery failed.",
      {
        registrationId,
        error,
      },
    );
  }

  revalidateProfessionalAccreditation(registrationId);
}
