export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
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
          dateOfBirth: true,
          age: true,
          eventSlug: true,
          status: true,

          identityDocuments: {
            select: {
              id: true,
              type: true,
              status: true,
              originalFilename: true,
              sizeBytes: true,
              uploadedAt: true,
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
      application: {
        ...application,

        identityDocuments:
          application.identityDocuments.map(
            (document) => ({
              ...document,
              sizeBytes:
                document.sizeBytes?.toString() ??
                null,
            })
          ),
      },
    });
  } catch (error) {
    console.error(
      "GET SHOWCASE IDENTITY ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load identity verification information.",
      },
      { status: 500 }
    );
  }
}
