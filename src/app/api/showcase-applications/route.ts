export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  calculateAgeOnDate,
} from "@/lib/showcase/lagos2027AgeEligibility";

const EVENT_SLUG = "lagos-2027";

type ApplicantSex = "MALE" | "FEMALE";

function isApplicantSex(
  value: unknown
): value is ApplicantSex {
  return value === "MALE" || value === "FEMALE";
}

/*
 * Used only for duplicate-registration checks.
 *
 * We keep the player's original phone formatting
 * in the application record, but compare numbers
 * without spaces, brackets, dashes or "+".
 */
function normalisePhone(
  value: unknown
) {
  return String(value ?? "")
    .replace(/\D/g, "")
    .trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      sex,
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

    if (!isApplicantSex(sex)) {
      return NextResponse.json(
        {
          error:
            "Please select the player's sex.",
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

    /*
     * Event configuration is authoritative.
     *
     * This keeps the application architecture reusable
     * for future men's, women's and open showcases.
     */
    const event =
      await prisma.event.findUnique({
        where: {
          slug: EVENT_SLUG,
        },

        select: {
          slug: true,
          name: true,

          footballStartsAt: true,

          showcaseCompetitionCategory: true,
          showcaseMinimumAge: true,
          showcaseMaximumAge: true,
        },
      });

    if (!event) {
      console.error(
        "LAGOS 2027 event is not configured."
      );

      return NextResponse.json(
        {
          error:
            "Lagos 2027 is not currently available for applications.",
        },
        { status: 503 }
      );
    }

    if (!event.footballStartsAt) {
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

    if (
      event.showcaseMinimumAge == null ||
      event.showcaseMaximumAge == null
    ) {
      console.error(
        "LAGOS 2027 age eligibility is not configured."
      );

      return NextResponse.json(
        {
          error:
            "Lagos 2027 eligibility cannot currently be verified. Please try again later.",
        },
        { status: 503 }
      );
    }

    /*
     * Competition category eligibility.
     */
    if (
      event.showcaseCompetitionCategory === "MEN" &&
      sex !== "MALE"
    ) {
      return NextResponse.json(
        {
          error:
            "Lagos 2027 is the Men's Football Showcase and is open to eligible male players.",
          code: "COMPETITION_CATEGORY_INELIGIBLE",
        },
        { status: 422 }
      );
    }

    if (
      event.showcaseCompetitionCategory === "WOMEN" &&
      sex !== "FEMALE"
    ) {
      return NextResponse.json(
        {
          error:
            "This Women's Football Showcase is open to eligible female players.",
          code: "COMPETITION_CATEGORY_INELIGIBLE",
        },
        { status: 422 }
      );
    }

    /*
     * Age is calculated on the first day of football,
     * not on the date the application is submitted.
     */
    const calculatedAge =
      calculateAgeOnDate(
        parsedDob,
        event.footballStartsAt
      );

    if (
      calculatedAge <
      event.showcaseMinimumAge
    ) {
      return NextResponse.json(
        {
          error:
            `You are below the minimum age for Lagos 2027. ` +
            `This programme is open only to players aged ` +
            `${event.showcaseMinimumAge}–${event.showcaseMaximumAge} ` +
            `on the first day of the programme.`,

          code: "AGE_TOO_YOUNG",
          ageAtEvent: calculatedAge,
        },
        { status: 422 }
      );
    }

    if (
      calculatedAge >
      event.showcaseMaximumAge
    ) {
      return NextResponse.json(
        {
          error:
            `You are above the maximum age for Lagos 2027. ` +
            `This programme is open only to players aged ` +
            `${event.showcaseMinimumAge}–${event.showcaseMaximumAge} ` +
            `on the first day of the programme.`,

          code: "AGE_TOO_OLD",
          ageAtEvent: calculatedAge,
        },
        { status: 422 }
      );
    }

    /*
     * Duplicate-registration protection.
     *
     * Do not create another Lagos 2027 application
     * when the same applicant appears to have
     * already registered.
     *
     * IMPORTANT:
     * We deliberately do not return the existing
     * application ID here. Applicant ownership /
     * secure resume access will be handled through
     * a verified recovery flow.
     */
    const normalisedEmail =
      email.trim().toLowerCase();

    const normalisedPhone =
      normalisePhone(phone);

    const possibleExistingApplications =
      await prisma.showcaseApplication.findMany({
        where: {
          eventSlug: EVENT_SLUG,
          dateOfBirth: parsedDob,
        },

        select: {
          email: true,
          phone: true,
        },
      });

    const emailDuplicate =
      possibleExistingApplications.some(
        (existing) =>
          existing.email
            .trim()
            .toLowerCase() ===
          normalisedEmail
      );

    if (emailDuplicate) {
      return NextResponse.json(
        {
          error:
            "An application already exists for Lagos 2027 matching this email address and date of birth. Please do not create another application or make another payment.",
          code:
            "DUPLICATE_APPLICATION",
        },
        { status: 409 }
      );
    }

    const phoneDuplicate =
      normalisedPhone.length > 0 &&
      possibleExistingApplications.some(
        (existing) =>
          normalisePhone(
            existing.phone
          ) === normalisedPhone
      );

    if (phoneDuplicate) {
      return NextResponse.json(
        {
          error:
            "We found a possible existing Lagos 2027 application matching this date of birth and phone number. Please do not start a second application. If this application belongs to you, use the existing application or contact ASCEND for assistance.",
          code:
            "POSSIBLE_DUPLICATE_APPLICATION",
        },
        { status: 409 }
      );
    }

    const application =
      await prisma.showcaseApplication.create({
        data: {
          eventSlug: EVENT_SLUG,

          assessmentFeeRequired: true,
          assessmentFeeAmount: 5000000,
          assessmentFeeCurrency: "NGN",

          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: normalisedEmail,
          phone: phone?.trim() || null,

          dateOfBirth: parsedDob,
          age: calculatedAge,
          sex,

          nationality:
            nationality?.trim() || null,

          countryOfResidence:
            countryOfResidence?.trim() || null,

          stateRegion:
            stateRegion?.trim() || null,

          city:
            city?.trim() || null,

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

          status: "DRAFT",
        },
      });

    return NextResponse.json({
      success: true,

      application: {
        id: application.id,
        status: application.status,
      },

      /*
       * Step 2 is Contact.
       * The previous /video value was a stale route
       * from the earlier application flow.
       */
      next:
        `/apply/lagos-2027/${application.id}/contact`,
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
