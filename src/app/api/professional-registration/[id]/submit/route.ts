import crypto from "node:crypto";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { sendProfessionalAccreditation } from "@/lib/email/sendProfessionalAccreditation";

function buildAccreditationNumber(sequence: number) {
  return `ASC-LAG27-PR-${String(sequence).padStart(4, "0")}`;
}

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
  // Generate accreditation only once.
  //
  let accreditationNumber =
    registration.accreditationNumber;

  let checkInToken =
    registration.checkInToken;

  if (!accreditationNumber) {
    const count =
      await prisma.professionalRegistration.count({
        where: {
          eventId: registration.eventId,
          accreditationNumber: {
            not: null,
          },
        },
      });

    accreditationNumber =
      buildAccreditationNumber(count + 1);
  }

  if (!checkInToken) {
    checkInToken =
      crypto.randomBytes(32).toString("hex");
  }

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

      status: "ACCREDITED",

      submittedAt:
        registration.submittedAt ||
        new Date(),

      approvedAt:
        registration.approvedAt ||
        new Date(),

      accreditationNumber,
      checkInToken,
    },
  });

  //
  // Send immediately.
  //
  await sendProfessionalAccreditation({
    registrationId: id,
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
