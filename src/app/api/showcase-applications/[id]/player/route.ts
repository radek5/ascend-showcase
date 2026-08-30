export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import {
  checkLagos2027AgeEligibility,
} from "@/lib/showcase/lagos2027AgeEligibility";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  req: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
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

const existing =
  await prisma.showcaseApplication.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      eventSlug: true,
    },
  });

if (!existing) {
  return NextResponse.json(
    {
      error:
        "Showcase application not found.",
    },
    { status: 404 }
  );
}

const event =
  await prisma.event.findUnique({
    where: {
      slug: existing.eventSlug,
    },
    select: {
      footballStartsAt: true,
    },
  });

if (!event?.footballStartsAt) {
  console.error(
    "Showcase footballStartsAt is not configured.",
    existing.eventSlug
  );

  return NextResponse.json(
    {
      error:
        "Eligibility cannot currently be verified. Please try again later.",
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
      await prisma.showcaseApplication.update({
        where: {
          id,
        },

        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),

          email: email.trim().toLowerCase(),
          phone: phone?.trim() || null,

          dateOfBirth: parsedDob,
          age: calculatedAge,

          nationality:
            nationality?.trim() || null,

          countryOfResidence:
            countryOfResidence?.trim() || null,

          stateRegion:
            stateRegion?.trim() || null,

          city: city?.trim() || null,

          position: position.trim(),

          secondaryPosition:
            secondaryPosition?.trim() || null,

          preferredFoot:
            preferredFoot?.trim() || null,

          currentClub:
            currentClub?.trim() || null,

          currentAcademy:
            currentAcademy?.trim() || null,

          footballBackground:
            footballBackground?.trim() || null,
        },
      });

    return NextResponse.json({
      success: true,

      application: {
        id: application.id,
      },

      next:
        `/apply/${application.eventSlug}/${application.id}/review`,
    });
  } catch (error) {
    console.error(
      "UPDATE SHOWCASE PLAYER ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "We could not update the player details. Please try again.",
      },
      { status: 500 }
    );
  }
}
