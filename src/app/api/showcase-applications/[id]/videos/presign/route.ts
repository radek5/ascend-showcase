export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { prisma } from "@/lib/prisma";
import {
  r2,
  R2_BUCKET_NAME,
} from "@/lib/storage/r2";

const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

const ALLOWED_SHOWCASE_TYPES = new Set([
  "MATCH_1",
  "MATCH_2",
  "HIGHLIGHTS",
  "ADDITIONAL_MATCH",
  "FULL_MATCH",
]);

const MAX_VIDEO_SIZE =
  500 * 1024 * 1024;

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

    const filename = String(
      body.filename || ""
    ).trim();

    const contentType = String(
      body.contentType || ""
    ).trim();

    const videoType = String(
      body.videoType || ""
    ).trim();

    const requestId = String(
      body.requestId || ""
    ).trim();

    const size = Number(body.size || 0);

    if (!filename) {
      return NextResponse.json(
        { error: "Filename missing." },
        { status: 400 }
      );
    }

    if (
      !ALLOWED_VIDEO_TYPES.has(contentType)
    ) {
      return NextResponse.json(
        {
          error:
            "Unsupported video format. Please use MP4, MOV or WebM.",
        },
        { status: 400 }
      );
    }

    if (
      !ALLOWED_SHOWCASE_TYPES.has(videoType)
    ) {
      return NextResponse.json(
        { error: "Invalid video type." },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(size) ||
      size <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid video file size." },
        { status: 400 }
      );
    }

    if (size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        {
          error:
            "Video is too large. Maximum upload size is 500 MB per video.",
        },
        { status: 400 }
      );
    }

    const application =
      await prisma.showcaseApplication.findUnique({
        where: { id },
        select: { id: true },
      });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      );
    }

    const extension =
      filename
        .split(".")
        .pop()
        ?.toLowerCase() || "video";

    const storageKey =
      `showcase-applications/${id}/videos/` +
      `${videoType.toLowerCase()}/` +
      `${crypto.randomUUID()}.${extension}`;

    /*
     * For the three initial evidence categories,
     * reuse the most recent record if one already
     * exists. This means applicants can replace a
     * video without cluttering the active submission.
     */
    let video =
      await prisma.showcaseApplicationVideo.findFirst({
        where: {
          applicationId: id,
          type: videoType as
            | "MATCH_1"
            | "MATCH_2"
            | "HIGHLIGHTS"
            | "ADDITIONAL_MATCH"
            | "FULL_MATCH",
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    let videoRequest = null;

if (requestId) {
  videoRequest =
    await prisma.showcaseVideoRequest.findFirst({
      where: {
        id: requestId,
        applicationId: id,
      },

      include: {
        videos: {
          where: {
            status: {
              in: [
                "UPLOADING",
                "SUBMITTED",
                "PROCESSING",
                "READY",
              ],
            },
          },
        },
      },
    });

  if (!videoRequest) {
    return NextResponse.json(
      {
        error:
          "Additional video request not found.",
      },
      { status: 404 }
    );
  }

  if (
    videoRequest.requestedVideoType !==
    videoType
  ) {
    return NextResponse.json(
      {
        error:
          "This video does not match the requested footage type.",
      },
      { status: 400 }
    );
  }

  if (
    videoRequest.videos.length >=
    videoRequest.requestedCount
  ) {
    return NextResponse.json(
      {
        error:
          "All requested video slots have already been submitted.",
      },
      { status: 400 }
    );
  }

  if (
    videoRequest.deadline &&
    new Date() > videoRequest.deadline
  ) {
    return NextResponse.json(
      {
        error:
          "The deadline for this additional video request has passed.",
      },
      { status: 400 }
    );
  }
}

    if (
      video &&
      ["MATCH_1", "MATCH_2", "HIGHLIGHTS"].includes(
        videoType
      )
    ) {
      video =
        await prisma.showcaseApplicationVideo.update({
          where: {
            id: video.id,
          },
          data: {
            status: "UPLOADING",
            storageProvider: "CLOUDFLARE_R2",
            storageKey,
            originalFilename: filename,
            mimeType: contentType,
            sizeBytes: BigInt(size),
            submittedAt: null,
          },
        });
    } else {
      video =
        await prisma.showcaseApplicationVideo.create({
          data: {
            applicationId: id,

            requestId:
              requestId || null,

            type: videoType as
              | "MATCH_1"
              | "MATCH_2"
              | "HIGHLIGHTS"
              | "ADDITIONAL_MATCH"
              | "FULL_MATCH",
            status: "UPLOADING",
            storageProvider: "CLOUDFLARE_R2",
            storageKey,
            originalFilename: filename,
            mimeType: contentType,
            sizeBytes: BigInt(size),
          },
        });
    }

    const command =
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: storageKey,
        ContentType: contentType,
      });

    const uploadUrl =
      await getSignedUrl(r2, command, {
        expiresIn: 15 * 60,
      });

    return NextResponse.json({
      success: true,
      uploadUrl,
      storageKey,
      videoId: video.id,
    });
  } catch (error) {
    console.error(
      "SHOWCASE VIDEO PRESIGN ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to prepare the video upload.",
      },
      { status: 500 }
    );
  }
}
