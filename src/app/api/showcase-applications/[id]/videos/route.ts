export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    const application =
      await prisma.showcaseApplication.findUnique({
        where: { id },

        select: {
          id: true,
          firstName: true,
          lastName: true,
          position: true,
          age: true,
          nationality: true,
          currentClub: true,
          status: true,

          videos: {
            orderBy: {
              createdAt: "asc",
            },
          },

          videoRequests: {
            orderBy: {
              requestedAt: "asc",
            },

            include: {
              videos: {
                orderBy: {
                  createdAt: "asc",
                },
              },
            },
          },
        },
      });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,

      application: {
        ...application,

        videos: application.videos.map((video) => ({
          ...video,

          sizeBytes: video.sizeBytes
            ? video.sizeBytes.toString()
            : null,
        })),

        videoRequests:
          application.videoRequests.map((request) => ({
            ...request,

            videos: request.videos.map((video) => ({
              ...video,

              sizeBytes: video.sizeBytes
                ? video.sizeBytes.toString()
                : null,
            })),
          })),
      },
    });
  } catch (error) {
    console.error(
      "GET SHOWCASE VIDEOS ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load application videos.",
      },
      { status: 500 }
    );
  }
}
