export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import {
  checkApplicantApplicationAccess,
  getApplicantApplicationAccessError,
} from "@/lib/applicants/applicationOwnership";

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const { id } = await params;

    const access = await checkApplicantApplicationAccess(id);

    if (!access.authorised) {
      const accessError = getApplicantApplicationAccessError(access);

      return NextResponse.json(
        {
          error: accessError.error,
          code: accessError.code,
        },
        { status: accessError.status },
      );
    }

    if (access.submittedAt) {
      return NextResponse.json(
        {
          error: "This application has already been submitted and identity documents can no longer be changed.",
          code: "APPLICATION_ALREADY_SUBMITTED",
        },
        { status: 409 },
      );
    }

    const applicationId = access.applicationId;

    const body = await request.json();

    const documentId = String(body.documentId || "").trim();

    const storageKey = String(body.storageKey || "").trim();

    if (!documentId || !storageKey) {
      return NextResponse.json(
        {
          error: "Identity document completion information is incomplete.",
        },
        { status: 400 },
      );
    }

    const expectedPrefix = `showcase-applications/${applicationId}/identity/`;

    if (!storageKey.startsWith(expectedPrefix)) {
      return NextResponse.json(
        { error: "Invalid storage key." },
        { status: 400 },
      );
    }

    const document = await prisma.showcaseIdentityDocument.findFirst({
      where: {
        id: documentId,
        applicationId,
      },
    });

    if (!document) {
      return NextResponse.json(
        {
          error: "Identity document record not found.",
        },
        { status: 404 },
      );
    }

    /*
     * Prevent a caller from completing a different
     * object than the one originally presigned.
     */
    if (document.storageKey !== storageKey) {
      return NextResponse.json(
        { error: "Storage key mismatch." },
        { status: 400 },
      );
    }

    const updated = await prisma.showcaseIdentityDocument.update({
      where: {
        id: document.id,
      },
      data: {
        status: "UPLOADED",
        storageProvider: "CLOUDFLARE_R2",
        storageKey,
        uploadedAt: new Date(),

        /*
         * A replacement must always be
         * reviewed again by RevelationX1
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
        originalFilename: updated.originalFilename,
      },
    });
  } catch (error) {
    console.error("COMPLETE SHOWCASE IDENTITY DOCUMENT ERROR", error);

    return NextResponse.json(
      {
        error: "The document uploaded but its details could not be saved.",
      },
      { status: 500 },
    );
  }
}
