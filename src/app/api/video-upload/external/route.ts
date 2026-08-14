import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const registrationId = String(
      body.registrationId || "",
    ).trim();

    const videoLink = String(
      body.videoLink || "",
    ).trim();

    if (!registrationId) {
      return NextResponse.json(
        { error: "Registration ID missing." },
        { status: 400 },
      );
    }

    if (!videoLink) {
      return NextResponse.json(
        { error: "Video link missing." },
        { status: 400 },
      );
    }

    try {
      new URL(videoLink);
    } catch {
      return NextResponse.json(
        { error: "Please enter a valid video URL." },
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
          sourceType: "EXTERNAL_LINK",
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    const data = {
      status: "SUBMITTED" as const,
      sourceType: "EXTERNAL_LINK",
      externalUrl: videoLink,
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
      "Unable to save external video:",
      error,
    );

    return NextResponse.json(
      { error: "Unable to save video link." },
      { status: 500 },
    );
  }
}
