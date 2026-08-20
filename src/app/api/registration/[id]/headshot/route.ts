import {
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  r2,
  R2_BUCKET_NAME,
} from "@/lib/storage/r2";

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  const { id } =
    await context.params;

  const registration =
    await prisma.registration.findUnique({
      where: {
        id,
      },
      select: {
        headshotUrl: true,
      },
    });

  if (
    !registration?.headshotUrl
  ) {
    return NextResponse.json(
      {
        error:
          "Player headshot not found.",
      },
      {
        status: 404,
      },
    );
  }

  try {
    const object =
      await r2.send(
        new GetObjectCommand({
          Bucket:
            R2_BUCKET_NAME,
          Key:
            registration.headshotUrl,
        }),
      );

    if (!object.Body) {
      return NextResponse.json(
        {
          error:
            "Player headshot unavailable.",
        },
        {
          status: 404,
        },
      );
    }

    const bytes =
      await object.Body.transformToByteArray();

      return new NextResponse(
       Buffer.from(bytes),
       {
        headers: {
          "Content-Type":
            object.ContentType ||
            "image/jpeg",

          "Cache-Control":
            "private, max-age=300",
        },
      },
    );
  } catch (error) {
    console.error(
      "Unable to load player headshot:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to load player headshot.",
      },
      {
        status: 500,
      },
    );
  }
}
