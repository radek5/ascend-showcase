export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const documentId = String(
      body.documentId || ""
    ).trim();

    const storageKey = String(
      body.storageKey || ""
    ).trim();

    const originalFilename = String(
      body.originalFilename || ""
    ).trim();

    const mimeType = String(
      body.mimeType || ""
    ).trim();

    const size = Number(body.size || 0);

    if (!documentId || !storageKey) {
      return NextResponse.json(
        {
          error:
            "Identity document completion information is incomplete.",
        },
        { status: 400 }
      );
    }

    const expectedPrefix =
      `showcase-applications/${id}/identity/`;

    if (!storageKey.startsWith(expectedPrefix)) {
      return NextResponse.json(
        { error: "Invalid storage key." },
        { status: 400 }
      );
    }

    const document =
      await prisma.showcaseIdentityDocument.findFirst({
        where: {
          id: documentId,
          applicationId: id,
        },
      });

    if (!document) {
      return NextResponse.json(
        {
          error:
            "Identity document record not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Prevent a caller from completing a different
     * object than the one originally presigned.
     */
    if (document.storageKey !== storageKey) {
      return NextResponse.json(
        { error: "Storage key mismatch." },
        { status: 400 }
      );
    }

    const updated =
      await prisma.showcaseIdentityDocument.update({
        where: {
          id: document.id,
        },
        data: {
          status: "UPLOADED",
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

          uploadedAt: new Date(),

          /*
           * A replacement must always be
           * reviewed again by ASCEND.
           */
          verifiedAt: null,
          verifiedBy: null,
          reviewNotes: null,
        },
      });

    return NextResponse.json({
      success: true,
      document: {
        id: updated.id,
        type: updated.type,
        status: updated.status,
        originalFilename:
          updated.originalFilename,
      },
    });
  } catch (error) {
    console.error(
      "COMPLETE SHOWCASE IDENTITY DOCUMENT ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "The document uploaded but its details could not be saved.",
      },
      { status: 500 }
    );
  }
}
