import "server-only";

import { prisma } from "@/lib/prisma";

import { getProfessionalRegistrationSession } from "./session";

export type ProfessionalRegistrationAccessResult =
  | {
      authorised: true;
      registrationId: string;
      status: string;
      submittedAt: Date | null;
    }
  | {
      authorised: false;
      reason:
        | "UNAUTHENTICATED"
        | "REGISTRATION_NOT_FOUND";
    };

export async function checkProfessionalRegistrationAccess(
  registrationId: string,
): Promise<ProfessionalRegistrationAccessResult> {
  const session =
    await getProfessionalRegistrationSession();

  if (
    !session ||
    session.professionalRegistrationId !==
      registrationId
  ) {
    return {
      authorised: false,
      reason: "UNAUTHENTICATED",
    };
  }

  const registration =
    await prisma.professionalRegistration.findUnique({
      where: {
        id: registrationId,
      },
      select: {
        id: true,
        status: true,
        submittedAt: true,
      },
    });

  if (!registration) {
    return {
      authorised: false,
      reason: "REGISTRATION_NOT_FOUND",
    };
  }

  return {
    authorised: true,
    registrationId: registration.id,
    status: registration.status,
    submittedAt: registration.submittedAt,
  };
}

export function getProfessionalRegistrationAccessError(
  result: Extract<
    ProfessionalRegistrationAccessResult,
    { authorised: false }
  >,
) {
  if (result.reason === "UNAUTHENTICATED") {
    return {
      error:
        "This professional registration session is not authorised.",
      code: "PROFESSIONAL_AUTH_REQUIRED",
      status: 401,
    };
  }

  return {
    error: "Professional registration not found.",
    code: "PROFESSIONAL_REGISTRATION_NOT_FOUND",
    status: 404,
  };
}
