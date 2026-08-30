export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import {
  checkLagos2027AgeEligibility,
} from "@/lib/showcase/lagos2027AgeEligibility";

const EVENT_SLUG = "lagos-2027";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      nationality,
      countryOfResidence,
      stateRegion,
      city,
      position,
      secondaryPosition,
      preferredFoot,
      currentClub,
      currentAcademy,
      footballBackground,
    } = body;

    if (!firstName?.trim()) {
      return NextResponse.json(
        { error: "First name is required." },
        { status: 400 }
      );
    }

    if (!lastName?.trim()) {
      return NextResponse.json(
        { error: "Last name is required." },
        { status: 400 }
      );
    }

    if (!email?.trim()) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    if (!position?.trim()) {
      return NextResponse.json(
        { error: "Primary position is required." },
        { status: 400 }
      );
    }

   if (!dateOfBirth) {
  return NextResponse.json(
    {
      error:
        "Date of birth is required for Lagos 2027.",
    },
    { status: 400 }
  );
}

const parsedDob = new Date(
  `${dateOfBirth}T00:00:00.000Z`
);

if (Number.isNaN(parsedDob.getTime())) {
  return NextResponse.json(
    { error: "Invalid date of birth." },
    { status: 400 }
  );
}

const event =
  await prisma.event.findUnique({
    where: {
      slug: EVENT_SLUG,
    },
    select: {
      footballStartsAt: true,
    },
  });

if (!event?.footballStartsAt) {
  console.error(
    "LAGOS 2027 footballStartsAt is not configured."
  );

  return NextResponse.json(
    {
      error:
        "Lagos 2027 eligibility cannot currently be verified. Please try again later.",
    },
    { status: 503 }
  );
}

const ageEligibility =
  checkLagos2027AgeEligibility(
    parsedDob,
    event.footballStartsAt
  );

if (!ageEligibility.eligible) {
  return NextResponse.json(
    {
      error:
        ageEligibility.reason === "AGE_TOO_YOUNG"
          ? "You are below the minimum age for Lagos 2027. This programme is open only to players aged 18–20 on the first day of the programme."
          : "You are above the maximum age for Lagos 2027. This programme is open only to players aged 18–20 on the first day of the programme.",

      code: ageEligibility.reason,
      ageAtEvent: ageEligibility.age,
    },
    { status: 422 }
  );
}

const calculatedAge =
  ageEligibility.age;

    const application =
      await prisma.showcaseApplication.create({
        data: {
          eventSlug: EVENT_SLUG,

          assessmentFeeRequired: true,
          assessmentFeeAmount: 5000000,
          assessmentFeeCurrency: "NGN",

          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone?.trim() || null,

          dateOfBirth: parsedDob,
          age: calculatedAge,

          nationality: nationality?.trim() || null,
          countryOfResidence:
            countryOfResidence?.trim() || null,
          stateRegion: stateRegion?.trim() || null,
          city: city?.trim() || null,

          position: position.trim(),
          secondaryPosition:
            secondaryPosition?.trim() || null,
          preferredFoot: preferredFoot?.trim() || null,

          currentClub: currentClub?.trim() || null,
          currentAcademy:
            currentAcademy?.trim() || null,
          footballBackground:
            footballBackground?.trim() || null,

          status: "AWAITING_VIDEO",
        },
      });

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        status: application.status,
      },
      next: `/apply/lagos-2027/${application.id}/video`,
    });
  } catch (error) {
    console.error(
      "CREATE SHOWCASE APPLICATION ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "We could not create the application. Please try again.",
      },
      { status: 500 }
    );
  }
}
