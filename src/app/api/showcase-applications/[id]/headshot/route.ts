export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentStaffUser } from "@/lib/staff/auth";
import { r2, R2_BUCKET_NAME } from "@/lib/storage/r2";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    /*
     * Showcase identity documents are private.
     *
     * This endpoint exists specifically so authorised
     * REVELATIONX1 staff can view the player's HEADSHOT
     * during event identity verification and check-in.
     *
     * Passport and NIN documents are never exposed here.
     */
    const staffUser = await getCurrentStaffUser();

    if (!staffUser) {
      return NextResponse.json(
        {
          error: "Staff authentication required.",
        },
        {
          status: 401,
        },
      );
    }

    const { id } = await params;

    const applicationId = id.trim();

    if (!applicationId) {
      return NextResponse.json(
        {
          error: "Application ID missing.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Resolve the storage key entirely on the server.
     *
     * The caller cannot supply a storage key or document
     * type, preventing access to PASSPORT or NIN objects
     * through this endpoint.
     */
    const headshot = await prisma.showcaseIdentityDocument.findUnique({
      where: {
        applicationId_type: {
          applicationId,
          type: "HEADSHOT",
        },
      },

      select: {
        storageKey: true,
        mimeType: true,
        uploadedAt: true,
      },
    });

    if (!headshot?.storageKey || !headshot.uploadedAt) {
      return NextResponse.json(
        {
          error: "Player headshot not found.",
        },
        {
          status: 404,
        },
      );
    }

    const object = await r2.send(
      new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: headshot.storageKey,
      }),
    );

    if (!object.Body) {
      return NextResponse.json(
        {
          error: "Player headshot unavailable.",
        },
        {
          status: 404,
        },
      );
    }

    const bytes = await object.Body.transformToByteArray();

    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": object.ContentType || headshot.mimeType || "image/jpeg",

        /*
         * Identity photographs must not be stored in
         * shared/public caches.
         */
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Unable to load showcase player headshot:", error);

    return NextResponse.json(
      {
        error: "Unable to load player headshot.",
      },
      {
        status: 500,
      },
    );
  }
}
