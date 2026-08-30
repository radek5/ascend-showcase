export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const videoId = String(body.videoId || "").trim();
    const storageKey = String(body.storageKey || "").trim();
    const originalFilename = String(
      body.originalFilename || ""
    ).trim();
    const mimeType = String(body.mimeType || "").trim();
    const size = Number(body.size || 0);

    if (!videoId || !storageKey) {
      return NextResponse.json(
        {
          error:
            "Video completion information is incomplete.",
        },
        { status: 400 }
      );
    }

    const expectedPrefix =
      `showcase-applications/${id}/videos/`;

    if (!storageKey.startsWith(expectedPrefix)) {
      return NextResponse.json(
        { error: "Invalid storage key." },
        { status: 400 }
      );
    }

    const video =
      await prisma.showcaseApplicationVideo.findFirst({
        where: {
          id: videoId,
          applicationId: id,
        },
      });

    if (!video) {
      return NextResponse.json(
        { error: "Video record not found." },
        { status: 404 }
      );
    }

    const updated =
      await prisma.showcaseApplicationVideo.update({
        where: {
          id: video.id,
        },

        data: {
          status: "SUBMITTED",
          storageProvider: "CLOUDFLARE_R2",
          storageKey,

          originalFilename:
            originalFilename || null,

          mimeType:
            mimeType || null,

          sizeBytes:
            Number.isFinite(size) && size > 0
              ? BigInt(size)
              : null,

          submittedAt: new Date(),
        },
      });

    /*
     * If this upload belongs to a formal
     * additional-video request, check whether
     * all requested videos have now been received.
     */
    if (updated.requestId) {
      const videoRequest =
        await prisma.showcaseVideoRequest.findUnique({
          where: {
            id: updated.requestId,
          },

          include: {
            videos: {
              where: {
                status: {
                  in: [
                    "SUBMITTED",
                    "PROCESSING",
                    "READY",
                  ],
                },
              },
            },
          },
        });

      if (
        videoRequest &&
        videoRequest.videos.length >=
          videoRequest.requestedCount &&
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
    console.error(
      "COMPLETE SHOWCASE VIDEO ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "The video uploaded but its details could not be saved.",
      },
      { status: 500 }
    );
  }
}
