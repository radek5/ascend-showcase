"use server";

import { redirect } from "next/navigation";

import {
  checkApplicantApplicationAccess,
  getApplicantApplicationAccessError,
} from "@/lib/applicants/applicationOwnership";
import { prisma } from "@/lib/prisma";

const KIT_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;
const SOCK_SIZES = ["S", "M", "L"] as const;
const SHOE_SIZE_SYSTEMS = ["UK", "EU", "US"] as const;

function value(formData: FormData, name: string) {
  return String(formData.get(name) || "").trim();
}

export async function updateShowcaseSizing(formData: FormData) {
  const applicationId = value(formData, "applicationId");
  const shirtSize = value(formData, "shirtSize");
  const shortsSize = value(formData, "shortsSize");
  const sockSize = value(formData, "sockSize");
  const shoeSizeSystem = value(formData, "shoeSizeSystem");
  const shoeSize = value(formData, "shoeSize");

  if (!applicationId) {
    throw new Error("Application ID is required.");
  }

  const access = await checkApplicantApplicationAccess(applicationId);

  if (!access.authorised) {
    const accessError = getApplicantApplicationAccessError(access);

    if (accessError.status === 401) {
      redirect("/apply/lagos-2027/account/login");
    }

    throw new Error(accessError.error);
  }

  if (
    !KIT_SIZES.includes(shirtSize as (typeof KIT_SIZES)[number]) ||
    !KIT_SIZES.includes(shortsSize as (typeof KIT_SIZES)[number]) ||
    !SOCK_SIZES.includes(sockSize as (typeof SOCK_SIZES)[number]) ||
    !SHOE_SIZE_SYSTEMS.includes(
      shoeSizeSystem as (typeof SHOE_SIZE_SYSTEMS)[number],
    ) ||
    !shoeSize
  ) {
    throw new Error("Please complete all kit and sizing fields.");
  }

  const application = await prisma.showcaseApplication.findUnique({
    where: { id: access.applicationId },
    select: {
      id: true,
      eventSlug: true,
      status: true,
    },
  });

  if (!application) {
    throw new Error("Application not found.");
  }

  if (application.status !== "DRAFT") {
    throw new Error("This application can no longer be edited.");
  }

  await prisma.showcaseApplication.update({
    where: { id: application.id },
    data: {
      shirtSize: shirtSize as (typeof KIT_SIZES)[number],
      shortsSize: shortsSize as (typeof KIT_SIZES)[number],
      sockSize: sockSize as (typeof SOCK_SIZES)[number],
      shoeSizeSystem:
        shoeSizeSystem as (typeof SHOE_SIZE_SYSTEMS)[number],
      shoeSize,
    },
  });

  redirect(`/apply/${application.eventSlug}/${application.id}/consent`);
}
