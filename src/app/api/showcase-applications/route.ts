export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { getCurrentApplicantUser } from "@/lib/applicants/auth";
import { prisma } from "@/lib/prisma";
import { calculateAgeOnDate } from "@/lib/showcase/lagos2027AgeEligibility";

const EVENT_SLUG = "lagos-2027";

type ApplicantSex = "MALE" | "FEMALE";

function isApplicantSex(value: unknown): value is ApplicantSex {
  return value === "MALE" || value === "FEMALE";
}

/*
 * Used only for duplicate-registration checks.
 *
 * We keep the player's original phone formatting
 * in the application record, but compare numbers
 * without spaces, brackets, dashes or "+".
 */
function normalisePhone(value: unknown) {
  return String(value ?? "")
    .replace(/\D/g, "")
    .trim();
}

export async function POST(req: Request) {
  try {
    const applicantUser = await getCurrentApplicantUser();

    if (!applicantUser) {
      return NextResponse.json(
        {
          error: "Please sign in before starting or continuing an application.",
          code: "APPLICANT_AUTH_REQUIRED",
        },
        { status: 401 },
      );
    }

    if (!applicantUser.emailVerifiedAt) {
      return NextResponse.json(
        {
          error: "Please verify your email address before continuing.",
          code: "APPLICANT_EMAIL_VERIFICATION_REQUIRED",
        },
        { status: 403 },
      );
    }

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
        { status: 400 },
      );
    }

    if (!lastName?.trim()) {
      return NextResponse.json(
        { error: "Last name is required." },
        { status: 400 },
      );
    }

    if (!email?.trim()) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }

    const submittedEmail = String(email).trim().toLowerCase();

    const accountEmail = applicantUser.email.trim().toLowerCase();

    if (submittedEmail !== accountEmail) {
      return NextResponse.json(
        {
          error:
            "The application email must match the verified email address on your REVELATIONX1 account.",
          code: "ACCOUNT_EMAIL_MISMATCH",
        },
        { status: 409 },
      );
    }

    if (!position?.trim()) {
      return NextResponse.json(
        { error: "Primary position is required." },
        { status: 400 },
      );
    }

    if (!dateOfBirth) {
      return NextResponse.json(
        {
          error: "Date of birth is required for Lagos 2027.",
        },
        { status: 400 },
      );
    }

    if (!isApplicantSex(sex)) {
      return NextResponse.json(
        {
          error: "Please select the player's sex.",
        },
        { status: 400 },
      );
    }

    const parsedDob = new Date(`${dateOfBirth}T00:00:00.000Z`);

    if (Number.isNaN(parsedDob.getTime())) {
      return NextResponse.json(
        { error: "Invalid date of birth." },
        { status: 400 },
      );
    }

    /*
     * Event configuration is authoritative.
     *
     * This keeps the application architecture reusable
     * for future men's, women's and open showcases.
     */
    const event = await prisma.event.findUnique({
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
      console.error("LAGOS 2027 event is not configured.");

      return NextResponse.json(
        {
          error: "Lagos 2027 is not currently available for applications.",
        },
        { status: 503 },
      );
    }

    if (!event.footballStartsAt) {
      console.error("LAGOS 2027 footballStartsAt is not configured.");

      return NextResponse.json(
        {
          error:
            "Lagos 2027 eligibility cannot currently be verified. Please try again later.",
        },
        { status: 503 },
      );
    }

    if (event.showcaseMinimumAge == null || event.showcaseMaximumAge == null) {
      console.error("LAGOS 2027 age eligibility is not configured.");

      return NextResponse.json(
        {
          error:
            "Lagos 2027 eligibility cannot currently be verified. Please try again later.",
        },
        { status: 503 },
      );
    }

    /*
     * Competition category eligibility.
     */
    if (event.showcaseCompetitionCategory === "MEN" && sex !== "MALE") {
      return NextResponse.json(
        {
          error:
            "Lagos 2027 is the Men's Football Showcase and is open to eligible male players.",
          code: "COMPETITION_CATEGORY_INELIGIBLE",
        },
        { status: 422 },
      );
    }

    if (event.showcaseCompetitionCategory === "WOMEN" && sex !== "FEMALE") {
      return NextResponse.json(
        {
          error:
            "This Women's Football Showcase is open to eligible female players.",
          code: "COMPETITION_CATEGORY_INELIGIBLE",
        },
        { status: 422 },
      );
    }

    /*
     * Age is calculated on the first day of football,
     * not on the date the application is submitted.
     */
    const calculatedAge = calculateAgeOnDate(parsedDob, event.footballStartsAt);

    if (calculatedAge < event.showcaseMinimumAge) {
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
        { status: 422 },
      );
    }

    if (calculatedAge > event.showcaseMaximumAge) {
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
        { status: 422 },
      );
    }

    /*
     * Application ownership, duplicate protection and
     * controlled legacy-draft recovery.
     *
     * A verified applicant account may have only one
     * Lagos 2027 application.
     *
     * Existing applications already owned by the account
     * are resumed directly.
     *
     * Legacy applications created before applicant accounts
     * may only be claimed when they are:
     *
     * - for this event;
     * - still unowned;
     * - still DRAFT / unsubmitted;
     * - an exact verified-email match; and
     * - an exact date-of-birth match.
     *
     * Submitted legacy applications are never silently claimed.
     */

    const normalisedEmail = accountEmail;

    const normalisedPhone = normalisePhone(phone);

    /*
     * First check whether this applicant account already
     * owns an application for this event.
     */
    const ownedApplication = await prisma.showcaseApplication.findFirst({
      where: {
        eventSlug: EVENT_SLUG,
        userId: applicantUser.id,
      },

      select: {
        id: true,
        status: true,
        submittedAt: true,
      },
    });

    if (ownedApplication) {
      if (ownedApplication.submittedAt) {
        return NextResponse.json(
          {
            error:
              "You have already submitted an application for Lagos 2027. Please use your applicant account to view its status.",
            code: "DUPLICATE_APPLICATION",
          },
          { status: 409 },
        );
      }

      const application = await prisma.showcaseApplication.update({
        where: {
          id: ownedApplication.id,
        },

        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: normalisedEmail,

          dateOfBirth: parsedDob,
          age: calculatedAge,
          sex,

          nationality: nationality?.trim() || null,

          countryOfResidence: countryOfResidence?.trim() || null,

          position: position.trim(),

          secondaryPosition: secondaryPosition?.trim() || null,

          preferredFoot: preferredFoot?.trim() || null,

          footballBackground: footballBackground?.trim() || null,
        },
      });

      return NextResponse.json({
        success: true,
        resumed: true,

        application: {
          id: application.id,
          status: application.status,
        },

        next: `/apply/lagos-2027/${application.id}/contact`,
      });
    }

    /*
     * Look for pre-account application records with the
     * same DOB. Email comparison is normalised in code so
     * older records with inconsistent casing can still be
     * detected safely.
     */
    const possibleExistingApplications =
      await prisma.showcaseApplication.findMany({
        where: {
          eventSlug: EVENT_SLUG,
          dateOfBirth: parsedDob,
        },

        select: {
          id: true,
          userId: true,
          email: true,
          phone: true,
          status: true,
          submittedAt: true,
        },
      });

    const emailMatches = possibleExistingApplications.filter(
      (existing) => existing.email.trim().toLowerCase() === normalisedEmail,
    );

    /*
     * Never silently claim a submitted legacy application.
     */
    if (emailMatches.some((existing) => Boolean(existing.submittedAt))) {
      return NextResponse.json(
        {
          error:
            "An application has already been submitted for Lagos 2027 matching this verified email address and date of birth. Please contact REVELATIONX1 if you need help accessing it.",
          code: "DUPLICATE_APPLICATION",
        },
        { status: 409 },
      );
    }

    /*
     * An application already linked to another account must
     * never be transferred simply because form data matches.
     */
    if (
      emailMatches.some(
        (existing) =>
          existing.userId !== null && existing.userId !== applicantUser.id,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "We found an existing Lagos 2027 application matching these details. Please contact REVELATIONX1 for assistance.",
          code: "APPLICATION_OWNERSHIP_CONFLICT",
        },
        { status: 409 },
      );
    }

    const claimableLegacyDrafts = emailMatches.filter(
      (existing) =>
        existing.userId === null &&
        existing.submittedAt === null &&
        existing.status === "DRAFT",
    );

    if (claimableLegacyDrafts.length > 1) {
      return NextResponse.json(
        {
          error:
            "We found more than one unfinished Lagos 2027 application matching your verified account details. Please contact REVELATIONX1 so we can safely resolve them.",
          code: "MULTIPLE_LEGACY_APPLICATIONS",
        },
        { status: 409 },
      );
    }

    if (claimableLegacyDrafts.length === 1) {
      const legacyApplication = claimableLegacyDrafts[0];

      const application = await prisma.$transaction(async (tx) => {
        /*
         * Claim only if the record is still unowned and
         * unsubmitted at the instant of the update.
         */
        const claimed = await tx.showcaseApplication.updateMany({
          where: {
            id: legacyApplication.id,
            userId: null,
            submittedAt: null,
            status: "DRAFT",
          },

          data: {
            userId: applicantUser.id,
          },
        });

        if (claimed.count !== 1) {
          return null;
        }

        return tx.showcaseApplication.update({
          where: {
            id: legacyApplication.id,
          },

          data: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: normalisedEmail,

            dateOfBirth: parsedDob,
            age: calculatedAge,
            sex,

            nationality: nationality?.trim() || null,

            countryOfResidence: countryOfResidence?.trim() || null,

            position: position.trim(),

            secondaryPosition: secondaryPosition?.trim() || null,

            preferredFoot: preferredFoot?.trim() || null,

            footballBackground: footballBackground?.trim() || null,
          },
        });
      });

      if (!application) {
        return NextResponse.json(
          {
            error:
              "We could not safely resume the existing application. Please try again or contact REVELATIONX1 for assistance.",
            code: "APPLICATION_CLAIM_CONFLICT",
          },
          { status: 409 },
        );
      }

      return NextResponse.json({
        success: true,
        resumed: true,
        claimed: true,

        application: {
          id: application.id,
          status: application.status,
        },

        next: `/apply/lagos-2027/${application.id}/contact`,
      });
    }

    /*
     * A matching DOB + phone remains a possible duplicate.
     * We do not use phone possession as proof of ownership.
     */
    const phoneDuplicate =
      normalisedPhone.length > 0 &&
      possibleExistingApplications.some(
        (existing) => normalisePhone(existing.phone) === normalisedPhone,
      );

    if (phoneDuplicate) {
      return NextResponse.json(
        {
          error:
            "We found a possible existing Lagos 2027 application matching this date of birth and phone number. Please do not start a second application. Contact REVELATIONX1 for assistance.",
          code: "POSSIBLE_DUPLICATE_APPLICATION",
        },
        { status: 409 },
      );
    }

    const application = await prisma.showcaseApplication.create({
      data: {
        eventSlug: EVENT_SLUG,
        userId: applicantUser.id,

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

        nationality: nationality?.trim() || null,

        countryOfResidence: countryOfResidence?.trim() || null,

        stateRegion: stateRegion?.trim() || null,

        city: city?.trim() || null,

        position: position.trim(),

        secondaryPosition: secondaryPosition?.trim() || null,

        preferredFoot: preferredFoot?.trim() || null,

        currentClub: currentClub?.trim() || null,

        currentAcademy: currentAcademy?.trim() || null,

        footballBackground: footballBackground?.trim() || null,

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
      next: `/apply/lagos-2027/${application.id}/contact`,
    });
  } catch (error) {
    console.error("CREATE SHOWCASE APPLICATION ERROR", error);

    return NextResponse.json(
      {
        error: "We could not create the application. Please try again.",
      },
      { status: 500 },
    );
  }
}
