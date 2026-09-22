import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  const { id } = await context.params;

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

  //
  // Submission is the boundary between applicant editing
  // and the REVELATIONX1 professional accreditation review.
  //
  // Accreditation, approval and event credentials are issued
  // separately by authorised staff after review.
  //
  await prisma.professionalRegistration.update({
    where: {
      id,
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
