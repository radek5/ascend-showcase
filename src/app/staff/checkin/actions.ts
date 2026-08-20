"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

export async function checkInPlayer(
  formData: FormData,
) {
  const staffUser = await requireStaffUser();

  const registrationId = String(
    formData.get("registrationId") || "",
  ).trim();

  if (!registrationId) {
    throw new Error("Registration ID missing.");
  }

const registration =
  await prisma.registration.findUnique({
    where: {
      id: registrationId,
    },
    include: {
      payments: {
        where: {
          status: "PAID",
        },
        take: 1,
      },
    },
  });

if (!registration) {
  throw new Error(
    "Player registration not found.",
  );
}

if (
  registration.status !== "PAID" ||
  registration.payments.length === 0
) {
  throw new Error(
    "Player registration and payment must both be confirmed before event check-in.",
  );
}

  // Idempotent — scanning/checking twice does not create another check-in.
  if (!registration.checkedInAt) {
    await prisma.registration.update({
      where: {
        id: registrationId,
      },
      data: {
        checkedInAt: new Date(),
        checkedInByStaffUserId:
          staffUser.id,
      },
    });
  }

  revalidatePath("/staff/checkin");
  revalidatePath("/staff/dashboard");
  revalidatePath("/staff/registrations");
  revalidatePath(
    `/staff/registrations/${registrationId}`,
  );
}

export async function checkInProfessional(
  formData: FormData,
) {
  const staffUser = await requireStaffUser();

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
    });

  if (!registration) {
    throw new Error(
      "Professional registration not found.",
    );
  }

  if (
    ![
      "APPROVED",
      "ACCREDITED",
      "CHECKED_IN",
    ].includes(registration.status)
  ) {
    throw new Error(
      "This professional registration is not approved for event check-in.",
    );
  }

  if (!registration.checkedInAt) {
    await prisma.professionalRegistration.update({
      where: {
        id: registrationId,
      },
      data: {
        checkedInAt: new Date(),
        checkedInByStaffUserId:
          staffUser.id,
        status: "CHECKED_IN",
      },
    });
  }

  revalidatePath("/staff/checkin");
  revalidatePath("/staff/dashboard");
  revalidatePath("/staff/professionals");
}
