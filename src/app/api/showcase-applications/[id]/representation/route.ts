export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import {
  checkApplicantApplicationAccess,
  getApplicantApplicationAccessError,
} from "@/lib/applicants/applicationOwnership";

function parseOptionalDate(value: unknown): Date | null {
  const text = String(value || "").trim();

  if (!text) {
    return null;
  }

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

export async function PUT(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const { id } = await params;

    const access = await checkApplicantApplicationAccess(id);

    if (!access.authorised) {
      const accessError = getApplicantApplicationAccessError(access);

      return NextResponse.json(
        {
          error: accessError.error,
          code: accessError.code,
        },
        { status: accessError.status },
      );
    }

    const applicationId = access.applicationId;

    if (access.submittedAt) {
      return NextResponse.json(
        {
          error: "This application has already been submitted and can no longer be edited.",
          code: "APPLICATION_ALREADY_SUBMITTED",
        },
        { status: 409 },
      );
    }

    const body = await req.json();

    const application = await prisma.showcaseApplication.findUnique({
      where: {
        id: applicationId,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 },
      );
    }

    if (!application.footballStatusCompletedAt) {
      return NextResponse.json(
        {
          error:
            "Please complete your Club & Academy Status before completing Representation.",
          code: "FOOTBALL_STATUS_INCOMPLETE",
          next: `/apply/lagos-2027/${applicationId}/football-status`,
        },
        { status: 409 },
      );
    }

    const hasAgent = body.hasAgent === "yes";

    if (body.hasAgent !== "yes" && body.hasAgent !== "no") {
      return NextResponse.json(
        {
          error: "Please confirm whether you are currently represented.",
        },
        { status: 400 },
      );
    }

    if (!body.declarationConfirmed) {
      return NextResponse.json(
        {
          error:
            "Please confirm the Full Disclosure Declaration before continuing.",
        },
        { status: 400 },
      );
    }

    const declarationAcceptedAt = new Date();

    if (!hasAgent) {
      if (
        body.ascendRepresentationInterest !== "yes" &&
        body.ascendRepresentationInterest !== "no"
      ) {
        return NextResponse.json(
          {
            error:
              "Please tell us whether you would like RevelationX1 to contact you about representation.",
          },
          { status: 400 },
        );
      }

      await prisma.showcaseApplication.update({
        where: {
          id: applicationId,
        },
        data: {
          hasAgent: false,

          interestedInAscendRepresentation:
            body.ascendRepresentationInterest === "yes",

          agentName: null,
          agencyName: null,
          agentEmail: null,
          agentPhone: null,
          agentCountry: null,
          fifaLicenceNumber: null,

          representationStart: null,
          representationEnd: null,
          exclusiveRepresentation: null,

          agentContactConsent: false,

          representationDeclarationAccepted: true,
          representationDeclarationAcceptedAt: declarationAcceptedAt,

          footballStatusDeclarationAccepted: true,
          footballStatusDeclarationAcceptedAt: declarationAcceptedAt,
          footballStatusLastConfirmedAt: declarationAcceptedAt,
          footballStatusVerification: "DECLARED",
        },
      });

      return NextResponse.json({
        success: true,
        next: `/apply/lagos-2027/${applicationId}/video`,
      });
    }

    const agentName = String(body.agentName || "").trim();

    if (!agentName) {
      return NextResponse.json(
        {
          error: "Agent full name is required.",
        },
        { status: 400 },
      );
    }

    const representationStartText = String(
      body.representationStartDate || "",
    ).trim();

    const representationEndText = String(
      body.representationEndDate || "",
    ).trim();

    const representationStart = parseOptionalDate(representationStartText);
    const representationEnd = parseOptionalDate(representationEndText);

    if (representationStartText && !representationStart) {
      return NextResponse.json(
        {
          error: "Please enter a valid representation start date.",
        },
        { status: 400 },
      );
    }

    if (representationEndText && !representationEnd) {
      return NextResponse.json(
        {
          error: "Please enter a valid representation end date.",
        },
        { status: 400 },
      );
    }

    if (
      representationStart &&
      representationEnd &&
      representationEnd < representationStart
    ) {
      return NextResponse.json(
        {
          error:
            "The representation end date cannot be earlier than the representation start date.",
        },
        { status: 400 },
      );
    }

    await prisma.showcaseApplication.update({
      where: {
        id: applicationId,
      },
      data: {
        hasAgent: true,

        interestedInAscendRepresentation: null,

        agentName,
        agencyName: String(body.agencyName || "").trim() || null,

        agentEmail: String(body.agentEmail || "").trim() || null,

        agentPhone: String(body.agentPhone || "").trim() || null,

        agentCountry: String(body.agentCountry || "").trim() || null,

        fifaLicenceNumber: String(body.fifaLicenceNumber || "").trim() || null,

        representationStart,
        representationEnd,

        exclusiveRepresentation: String(body.exclusive || "").trim() || null,

        agentContactConsent: Boolean(body.contactAuthorised),

        representationDeclarationAccepted: true,
        representationDeclarationAcceptedAt: declarationAcceptedAt,

        footballStatusDeclarationAccepted: true,
        footballStatusDeclarationAcceptedAt: declarationAcceptedAt,
        footballStatusLastConfirmedAt: declarationAcceptedAt,
        footballStatusVerification: "DECLARED",
      },
    });

    return NextResponse.json({
      success: true,
      next: `/apply/lagos-2027/${applicationId}/video`,
    });
  } catch (error) {
    console.error("UPDATE SHOWCASE REPRESENTATION ERROR", error);

    return NextResponse.json(
      {
        error: "We could not save the representation information.",
      },
      { status: 500 },
    );
  }
}
