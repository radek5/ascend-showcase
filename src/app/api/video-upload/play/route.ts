import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { prisma } from "@/lib/prisma";
import {
  r2,
  R2_BUCKET_NAME,
} from "@/lib/storage/r2";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const videoId = String(
      body.videoId || "",
    ).trim();

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID missing." },
        { status: 400 },
      );
    }

    const video =
      await prisma.playerVideo.findUnique({
        where: {
          id: videoId,
        },
        select: {
          id: true,
          sourceType: true,
          storageKey: true,
        },
      });

    if (!video) {
      return NextResponse.json(
        { error: "Video not found." },
        { status: 404 },
      );
    }

    if (
      video.sourceType !== "DIRECT_UPLOAD" ||
      !video.storageKey
    ) {
      return NextResponse.json(
        {
          error:
            "This video is not a directly uploaded file.",
        },
        { status: 400 },
      );
    }

    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: video.storageKey,
    });

    const playbackUrl = await getSignedUrl(
      r2,
      command,
      {
        expiresIn: 15 * 60,
      },
    );

    return NextResponse.json({
      playbackUrl,
    });
  } catch (error) {
    console.error(
      "Unable to create video playback URL:",
      error,
    );

    return NextResponse.json(
      {
        error: "Unable to open video.",
      },
      {
        status: 500,
      },
    );
  }
}
