export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import {
  checkApplicantApplicationAccess,
  getApplicantApplicationAccessError,
} from "@/lib/applicants/applicationOwnership";

export async function GET(
  _req: Request,
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

    const application = await prisma.showcaseApplication.findUnique({
      where: {
        id: applicationId,
      },

      select: {
        id: true,
        firstName: true,
        lastName: true,
        position: true,
        age: true,
        nationality: true,
        currentClub: true,
        status: true,

        videoExemption: {
          select: {
            status: true,
            reason: true,
          },
        },

        selectedPlayerRecord: {
          select: {
            footballSelected: true,
            matchedApplicationId: true,
          },
        },

        videos: {
          orderBy: {
            createdAt: "asc",
          },
        },

        videoRequests: {
          orderBy: {
            requestedAt: "asc",
          },

          include: {
            videos: {
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 },
      );
    }

    const { videoExemption, selectedPlayerRecord, ...publicApplication } =
      application;

    const preselected =
      selectedPlayerRecord?.footballSelected === true &&
      selectedPlayerRecord.matchedApplicationId === application.id;

    const videoExempt = videoExemption?.status === "MATCHED" || preselected;

    return NextResponse.json({
      success: true,

      application: {
        ...publicApplication,

        videoExempt,
        preselected,

        videoExemptionReason:
          videoExempt && videoExemption?.reason === "PREVIOUSLY_OBSERVED_LIVE"
            ? "PREVIOUSLY_OBSERVED_LIVE"
            : null,

        videos: application.videos.map((video) => ({
          ...video,
          sizeBytes: video.sizeBytes ? video.sizeBytes.toString() : null,
        })),

        videoRequests: application.videoRequests.map((request) => ({
          ...request,

          videos: request.videos.map((video) => ({
            ...video,
            sizeBytes: video.sizeBytes ? video.sizeBytes.toString() : null,
          })),
        })),
      },
    });
  } catch (error) {
    console.error("GET SHOWCASE VIDEOS ERROR", error);

    return NextResponse.json(
      {
        error: "Unable to load application videos.",
      },
      { status: 500 },
    );
  }
}
