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

const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500 MB

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const registrationId = String(
      body.registrationId || "",
    ).trim();

    const filename = String(
      body.filename || "",
    ).trim();

    const contentType = String(
      body.contentType || "",
    ).trim();

    const size = Number(body.size || 0);

    if (!registrationId) {
      return NextResponse.json(
        {
          error: "Registration ID missing.",
        },
        {
          status: 400,
        },
      );
    }

    if (!filename) {
      return NextResponse.json(
        {
          error: "Filename missing.",
        },
        {
          status: 400,
        },
      );
    }

    if (!ALLOWED_VIDEO_TYPES.has(contentType)) {
      return NextResponse.json(
        {
          error:
            "Unsupported video format. Please use MP4, MOV or WebM.",
        },
        {
          status: 400,
        },
      );
    }

    if (!Number.isFinite(size) || size <= 0) {
      return NextResponse.json(
        {
          error: "Invalid video file size.",
        },
        {
          status: 400,
        },
      );
    }

    if (size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        {
          error:
            "Video is too large. Maximum upload size is 500 MB.",
        },
        {
          status: 400,
        },
      );
    }

    const registration =
      await prisma.registration.findUnique({
        where: {
          id: registrationId,
        },

        select: {
          id: true,
        },
      });

    if (!registration) {
      return NextResponse.json(
        {
          error: "Registration not found.",
        },
        {
          status: 404,
        },
      );
    }

    const extension =
      filename.split(".").pop()?.toLowerCase() || "video";

    const storageKey =
      `registrations/${registrationId}/videos/` +
      `${crypto.randomUUID()}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: storageKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(
      r2,
      command,
      {
        expiresIn: 15 * 60,
      },
    );

    return NextResponse.json({
      uploadUrl,
      storageKey,
    });
  } catch (error) {
    console.error(
      "Unable to create R2 video upload URL:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to prepare the video upload.",
      },
      {
        status: 500,
      },
    );
  }
}
