"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function updateProfessionalAccommodation(
  formData: FormData,
) {
  const registrationId = String(
    formData.get("registrationId") || "",
  ).trim();

  const hotelStatus = String(
    formData.get("hotelStatus") || "",
  ).trim();

  const lagosAddress = String(
    formData.get("lagosAddress") || "",
  ).trim();

  if (!registrationId) {
    throw new Error(
      "Professional registration ID missing.",
    );
  }

  if (
    !["YES", "NO", "NOT_BOOKED"].includes(hotelStatus)
  ) {
    throw new Error(
      "Please select your accommodation status.",
    );
  }

  if (hotelStatus === "NO" && !lagosAddress) {
    throw new Error(
      "Please provide your address in Lagos.",
    );
  }

  const registration =
    await prisma.professionalRegistration.findUnique({
      where: {
        id: registrationId,
      },
      select: {
        id: true,
      },
    });

  if (!registration) {
    throw new Error(
      "Professional registration not found.",
    );
  }

  await prisma.professionalRegistration.update({
    where: {
      id: registrationId,
    },
    data: {
      hotelStatus,
      lagosAddress:
        hotelStatus === "NO"
          ? lagosAddress
          : null,
    },
  });

  redirect(
    `/professional-registration/review?registration=${registrationId}`,
  );
}
