import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { sendProfessionalRegistrationConfirmation } from "@/lib/email/sendProfessionalRegistrationConfirmation";
import {
  checkProfessionalRegistrationAccess,
  getProfessionalRegistrationAccessError,
} from "@/lib/professionals/registrationOwnership";

export async function POST(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  const { id } = await context.params;

  const access =
    await checkProfessionalRegistrationAccess(id);

  if (!access.authorised) {
    const error =
      getProfessionalRegistrationAccessError(access);

    return NextResponse.json(
      {
        error: error.error,
        code: error.code,
      },
      {
        status: error.status,
      },
    );
  }

  const formData = await request.formData();

  const safeguardingConsent =
    formData.get("safeguardingConsent") === "on";

  const privacyConsent =
    formData.get("privacyConsent") === "on";

  const futureEventConsent =
    formData.get("futureEventConsent") === "on";

  if (!safeguardingConsent || !privacyConsent) {
    return NextResponse.json(
      {
        error:
          "You must accept the safeguarding requirements and privacy notice.",
      },
      {
        status: 400,
      },
    );
  }

  const registration =
    await prisma.professionalRegistration.findUnique({
      where: {
        id,
      },
    });

  if (!registration) {
    return NextResponse.json(
      {
        error: "Professional registration not found.",
      },
      {
        status: 404,
      },
    );
  }

  if (registration.status !== "DRAFT") {
    return NextResponse.json(
      {
        error: "This professional registration has already been submitted.",
      },
      {
        status: 409,
      },
    );
  }

  //
  // Submission is the boundary between applicant editing
  // and the REVELATIONX1 professional accreditation review.
  //
  // Accreditation, approval and event credentials are issued
  // separately by authorised staff after review.
  //
  const submission =
    await prisma.professionalRegistration.updateMany({
      where: {
        id,
        status: "DRAFT",
      },

      data: {
        safeguardingConsent: true,
        privacyConsent: true,

        futureEventConsent,
        futureEventConsentAt: futureEventConsent
          ? registration.futureEventConsentAt || new Date()
          : null,

        status: "SUBMITTED",

        submittedAt:
          registration.submittedAt ||
          new Date(),
      },
    });

  if (submission.count !== 1) {
    return NextResponse.json(
      {
        error: "This professional registration has already been submitted.",
      },
      {
        status: 409,
      },
    );
  }

  try {
    await sendProfessionalRegistrationConfirmation({
      registrationId: id,
    });
  } catch (error) {
    console.error(
      "Professional registration submitted, but confirmation email delivery failed.",
      {
        registrationId: id,
        error,
      },
    );
  }

  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host");

  const protocol =
    request.headers.get("x-forwarded-proto") ||
    "http";

  if (!host) {
    throw new Error(
      "Unable to determine application host.",
    );
  }

  const redirectUrl = new URL(
    `/professional-registration/confirmation?registration=${id}`,
    `${protocol}://${host}`,
  );

  return NextResponse.redirect(
    redirectUrl,
    303,
  );
}
