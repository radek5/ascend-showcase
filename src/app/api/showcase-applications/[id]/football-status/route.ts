export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function parseDate(value: unknown): Date | null {
  const text = String(value || "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return null;
  }

  const date = new Date(`${text}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== text
  ) {
    return null;
  }

  return date;
}

export async function PUT(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const body = await req.json();

    const application = await prisma.showcaseApplication.findUnique({
      where: { id },
      select: {
        id: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        {
          error: "Application not found.",
        },
        { status: 404 },
      );
    }

    const currentlyAtClub =
      body.currentlyAtClub === true ||
      body.currentlyAtClub === "true" ||
      body.currentlyAtClub === "on";

    const currentlyAtAcademy =
      body.currentlyAtAcademy === true ||
      body.currentlyAtAcademy === "true" ||
      body.currentlyAtAcademy === "on";

    const currentClub = String(body.currentClub || "").trim();

    const currentAcademy = String(body.currentAcademy || "").trim();

    const hasClubDetails = Boolean(currentClub);

    const hasAcademyDetails = Boolean(currentAcademy);

    const clubStartDate = hasClubDetails
      ? parseDate(body.currentClubStartDate)
      : null;

    const clubEndDate =
      !hasClubDetails || currentlyAtClub
        ? null
        : parseDate(body.currentClubEndDate);

    const academyStartDate = hasAcademyDetails
      ? parseDate(body.currentAcademyStartDate)
      : null;

    const academyEndDate =
      !hasAcademyDetails || currentlyAtAcademy
        ? null
        : parseDate(body.currentAcademyEndDate);

    if (hasClubDetails) {
      if (!clubStartDate) {
        return NextResponse.json(
          {
            error: "Please enter the date you started with this club.",
          },
          { status: 400 },
        );
      }

      if (!currentlyAtClub && !clubEndDate) {
        return NextResponse.json(
          {
            error:
              "Please enter the date you left this club or confirm that you are currently with the club.",
          },
          { status: 400 },
        );
      }

      if (clubEndDate && clubEndDate < clubStartDate) {
        return NextResponse.json(
          {
            error:
              "The club end date cannot be earlier than the club start date.",
          },
          { status: 400 },
        );
      }
    }

    if (hasAcademyDetails) {
      if (!academyStartDate) {
        return NextResponse.json(
          {
            error: "Please enter the date you started with this academy.",
          },
          { status: 400 },
        );
      }

      if (!currentlyAtAcademy && !academyEndDate) {
        return NextResponse.json(
          {
            error:
              "Please enter the date you left this academy or confirm that you are currently with the academy.",
          },
          { status: 400 },
        );
      }

      if (academyEndDate && academyEndDate < academyStartDate) {
        return NextResponse.json(
          {
            error:
              "The academy end date cannot be earlier than the academy start date.",
          },
          { status: 400 },
        );
      }
    }

    await prisma.showcaseApplication.update({
      where: { id },

      data: {
        currentClub: currentClub || null,

        currentClubStartDate: clubStartDate,

        currentClubEndDate: clubEndDate,

        currentAcademy: currentAcademy || null,

        currentAcademyStartDate: academyStartDate,

        currentAcademyEndDate: academyEndDate,

        // Club / academy information has been saved or reconfirmed.
        // Require the applicant to complete the combined Full Disclosure
        // declaration again in Step 4B.
        footballStatusDeclarationAccepted: false,
        footballStatusDeclarationAcceptedAt: null,
        footballStatusLastConfirmedAt: null,
        footballStatusVerification: "NOT_DECLARED",
      },
    });

    return NextResponse.json({
      success: true,

      next: `/apply/lagos-2027/${id}/representation`,
    });
  } catch (error) {
    console.error("UPDATE SHOWCASE FOOTBALL STATUS ERROR", error);

    return NextResponse.json(
      {
        error: "We could not save your club and academy information.",
      },
      { status: 500 },
    );
  }
}
