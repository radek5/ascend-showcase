export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import {
  checkApplicantApplicationAccess,
  getApplicantApplicationAccessError,
} from "@/lib/applicants/applicationOwnership";

export async function POST(
  request: Request,
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

    const body = await request.json();

    const videoId = String(body.videoId || "").trim();
    const storageKey = String(body.storageKey || "").trim();

    if (!videoId || !storageKey) {
      return NextResponse.json(
        {
          error: "Video completion information is incomplete.",
        },
        { status: 400 },
      );
    }

    const expectedPrefix = `showcase-applications/${applicationId}/videos/`;

    if (!storageKey.startsWith(expectedPrefix)) {
      return NextResponse.json(
        { error: "Invalid storage key." },
        { status: 400 },
      );
    }

    const video = await prisma.showcaseApplicationVideo.findFirst({
      where: {
        id: videoId,
        applicationId,
      },
    });

    if (!video) {
      return NextResponse.json(
        { error: "Video record not found." },
        { status: 404 },
      );
    }

    if (video.storageKey !== storageKey) {
      return NextResponse.json(
        { error: "Storage key mismatch." },
        { status: 400 },
      );
    }

    /*
     * Submission may occur between presigning and completion.
     *
     * After submission, only a video belonging to a formal
     * additional-video request may be completed. Initial evidence
     * videos are therefore protected even across that race.
     */
    if (access.submittedAt) {
      if (!video.requestId) {
        return NextResponse.json(
          {
            error: "This application has already been submitted and its original videos can no longer be changed.",
            code: "APPLICATION_ALREADY_SUBMITTED",
          },
          { status: 409 },
        );
      }

      const videoRequest = await prisma.showcaseVideoRequest.findFirst({
        where: {
          id: video.requestId,
          applicationId,
        },

        select: {
          id: true,
          requestedVideoType: true,
          deadline: true,
        },
      });

      if (!videoRequest || videoRequest.requestedVideoType !== video.type) {
        return NextResponse.json(
          {
            error: "This video is not linked to a valid additional-video request.",
          },
          { status: 403 },
        );
      }

      if (videoRequest.deadline && new Date() > videoRequest.deadline) {
        return NextResponse.json(
          {
            error: "The deadline for this additional video request has passed.",
          },
          { status: 400 },
        );
      }
    }

    const updated = await prisma.showcaseApplicationVideo.update({
      where: {
        id: video.id,
      },

      data: {
        status: "SUBMITTED",
        storageProvider: "CLOUDFLARE_R2",
        storageKey,
        submittedAt: new Date(),
      },
    });

    /*
     * If this upload belongs to a formal
     * additional-video request, check whether
     * all requested videos have now been received.
     */
    if (updated.requestId) {
      const videoRequest = await prisma.showcaseVideoRequest.findFirst({
        where: {
          id: updated.requestId,
          applicationId,
        },

        include: {
          videos: {
            where: {
              status: {
                in: ["SUBMITTED", "PROCESSING", "READY"],
              },
            },
          },
        },
      });

      if (
        videoRequest &&
        videoRequest.videos.length >= videoRequest.requestedCount &&
        !videoRequest.completedAt
      ) {
        await prisma.showcaseVideoRequest.update({
          where: {
            id: videoRequest.id,
          },

          data: {
            completedAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,

      video: {
        id: updated.id,
        type: updated.type,
        status: updated.status,
      },
    });
  } catch (error) {
    console.error("COMPLETE SHOWCASE VIDEO ERROR", error);

    return NextResponse.json(
      {
        error: "The video uploaded but its details could not be saved.",
      },
      { status: 500 },
    );
  }
}
