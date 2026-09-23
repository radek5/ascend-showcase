"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { checkProfessionalRegistrationAccess } from "@/lib/professionals/registrationOwnership";

const ALLOWED_ROLES = [
  "CLUB_REPRESENTATIVE",
  "SCOUT",
  "FOOTBALL_AGENT",
] as const;

type ProfessionalRole =
  (typeof ALLOWED_ROLES)[number];

export async function updateProfessionalRole(
  formData: FormData,
) {
  const registrationId = String(
    formData.get("registrationId") || "",
  ).trim();

  const role = String(
    formData.get("role") || "",
  ).trim();

  if (!registrationId) {
    throw new Error(
      "Professional registration ID missing.",
    );
  }

  if (
    !ALLOWED_ROLES.includes(
      role as ProfessionalRole,
    )
  ) {
    throw new Error(
      "Please select a valid professional role.",
    );
  }

  const access =
    await checkProfessionalRegistrationAccess(
      registrationId,
    );

  if (!access.authorised) {
    throw new Error(
      "Professional registration not found or not authorised.",
    );
  }

  if (access.status !== "DRAFT") {
    throw new Error(
      "This professional registration has already been submitted.",
    );
  }

  const update =
    await prisma.professionalRegistration.updateMany({
      where: {
        id: registrationId,
        status: "DRAFT",
      },
      data: {
        role: role as ProfessionalRole,
      },
    });

  if (update.count !== 1) {
    throw new Error(
      "This professional registration can no longer be changed.",
    );
  }

  redirect(
    `/professional-registration/details?registration=${registrationId}`,
  );
}
