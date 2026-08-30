export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const application =
      await prisma.showcaseApplication.findUnique({
        where: { id },
      });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      );
    }

    const hasAgent = body.hasAgent === "yes";

    if (
      body.hasAgent !== "yes" &&
      body.hasAgent !== "no"
    ) {
      return NextResponse.json(
        {
          error:
            "Please confirm whether you are currently represented.",
        },
        { status: 400 }
      );
    }

    if (!body.declarationConfirmed) {
      return NextResponse.json(
        {
          error:
            "Please confirm that the representation information is accurate.",
        },
        { status: 400 }
      );
    }

    if (!hasAgent) {
      if (
        body.ascendRepresentationInterest !== "yes" &&
        body.ascendRepresentationInterest !== "no"
      ) {
        return NextResponse.json(
          {
            error:
              "Please tell us whether you would like ASCEND to contact you about representation.",
          },
          { status: 400 }
        );
      }

      await prisma.showcaseApplication.update({
        where: { id },
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
          representationDeclarationAcceptedAt:
            new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        next: `/apply/lagos-2027/${id}/video`,
      });
    }

    const agentName = String(
      body.agentName || ""
    ).trim();

    if (!agentName) {
      return NextResponse.json(
        {
          error: "Agent full name is required.",
        },
        { status: 400 }
      );
    }

    const representationStart =
      body.representationStartDate
        ? new Date(
            `${body.representationStartDate}T00:00:00.000Z`
          )
        : null;

    const representationEnd =
      body.representationEndDate
        ? new Date(
            `${body.representationEndDate}T00:00:00.000Z`
          )
        : null;

    await prisma.showcaseApplication.update({
      where: { id },
      data: {
        hasAgent: true,

        interestedInAscendRepresentation: null,

        agentName,
        agencyName:
          String(body.agencyName || "").trim() ||
          null,

        agentEmail:
          String(body.agentEmail || "").trim() ||
          null,

        agentPhone:
          String(body.agentPhone || "").trim() ||
          null,

        agentCountry:
          String(body.agentCountry || "").trim() ||
          null,

        fifaLicenceNumber:
          String(
            body.fifaLicenceNumber || ""
          ).trim() || null,

        representationStart,
        representationEnd,

        exclusiveRepresentation:
          String(body.exclusive || "").trim() ||
          null,

        agentContactConsent:
          Boolean(body.contactAuthorised),

        representationDeclarationAccepted: true,
        representationDeclarationAcceptedAt:
          new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      next: `/apply/lagos-2027/${id}/video`,
    });
  } catch (error) {
    console.error(
      "UPDATE SHOWCASE REPRESENTATION ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "We could not save the representation information.",
      },
      { status: 500 }
    );
  }
}
