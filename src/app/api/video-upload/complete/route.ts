import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const registrationId = String(
      body.registrationId || "",
    ).trim();

    const storageKey = String(
      body.storageKey || "",
    ).trim();

    const originalFilename = String(
      body.originalFilename || "",
    ).trim();

    const mimeType = String(
      body.mimeType || "",
    ).trim();

    const size = Number(body.size || 0);

    if (!registrationId) {
      return NextResponse.json(
        { error: "Registration ID missing." },
        { status: 400 },
      );
    }

    if (!storageKey) {
      return NextResponse.json(
        { error: "Storage key missing." },
        { status: 400 },
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
        { error: "Registration not found." },
        { status: 404 },
      );
    }

    const existingVideo =
      await prisma.playerVideo.findFirst({
        where: {
          registrationId,
          sourceType: "DIRECT_UPLOAD",
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    const data = {
      status: "SUBMITTED" as const,
      sourceType: "DIRECT_UPLOAD",
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
    };

    if (existingVideo) {
      await prisma.playerVideo.update({
        where: {
          id: existingVideo.id,
        },
        data,
      });
    } else {
      await prisma.playerVideo.create({
        data: {
          registrationId,
          ...data,
        },
      });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Unable to complete video upload:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to save uploaded video details.",
      },
      {
        status: 500,
      },
    );
  }
}
