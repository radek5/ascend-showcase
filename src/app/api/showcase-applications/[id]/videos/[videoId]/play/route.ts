export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { prisma } from "@/lib/prisma";
import { r2, R2_BUCKET_NAME } from "@/lib/storage/r2";

import {
  checkApplicantApplicationAccess,
  getApplicantApplicationAccessError,
} from "@/lib/applicants/applicationOwnership";

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      videoId: string;
    }>;
  },
) {
  try {
    const { id, videoId } = await params;

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

    const video = await prisma.showcaseApplicationVideo.findFirst({
      where: {
        id: videoId,
        applicationId,
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
    console.error("SHOWCASE VIDEO PLAYBACK ERROR", error);

    return NextResponse.json(
      {
        error: "Unable to prepare video playback.",
      },
      { status: 500 },
    );
  }
}
