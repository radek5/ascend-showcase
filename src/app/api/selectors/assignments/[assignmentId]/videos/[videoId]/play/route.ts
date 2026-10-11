export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { prisma } from "@/lib/prisma";
import { requireSelector } from "@/lib/selectors/auth";
import { r2, R2_BUCKET_NAME } from "@/lib/storage/r2";

const PLAYABLE_VIDEO_STATUSES = ["SUBMITTED", "PROCESSING", "READY"] as const;

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      assignmentId: string;
      videoId: string;
    }>;
  },
) {
  try {
    const selector = await requireSelector();
    const { assignmentId, videoId } = await params;

    const assignment = await prisma.selectorAssignment.findFirst({
      where: {
        id: assignmentId,
        selectorId: selector.id,
        status: {
          not: "CANCELLED",
        },
      },
      select: {
        applicationId: true,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found." },
        { status: 404 },
      );
    }

    const video = await prisma.showcaseApplicationVideo.findFirst({
      where: {
        id: videoId,
        applicationId: assignment.applicationId,
        status: {
          in: [...PLAYABLE_VIDEO_STATUSES],
        },
      },
      select: {
        storageKey: true,
      },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found." }, { status: 404 });
    }

    if (!video.storageKey) {
      return NextResponse.json(
        { error: "Video file is not available." },
        { status: 404 },
      );
    }

    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: video.storageKey,
    });

    const playbackUrl = await getSignedUrl(r2, command, {
      expiresIn: 15 * 60,
    });

    return NextResponse.json({
      success: true,
      playbackUrl,
    });
  } catch (error) {
    console.error("SELECTOR VIDEO PLAYBACK ERROR", error);

    return NextResponse.json(
      {
        error: "Unable to prepare video playback.",
      },
      { status: 500 },
    );
  }
}
