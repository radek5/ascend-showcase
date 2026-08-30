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

const ALLOWED_DOCUMENT_TYPES = new Set([
  "PASSPORT",
  "NIN",
  "HEADSHOT",
]);

const ALLOWED_DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

const ALLOWED_HEADSHOT_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
]);

const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;
const MAX_HEADSHOT_SIZE = 5 * 1024 * 1024;

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

    const documentType = String(
      body.documentType || ""
    ).trim();

    const size = Number(body.size || 0);

    if (!filename) {
      return NextResponse.json(
        { error: "Filename missing." },
        { status: 400 }
      );
    }

    if (!ALLOWED_DOCUMENT_TYPES.has(documentType)) {
      return NextResponse.json(
        { error: "Invalid identity document type." },
        { status: 400 }
      );
    }

    const isHeadshot =
      documentType === "HEADSHOT";

    const allowedMimeTypes = isHeadshot
      ? ALLOWED_HEADSHOT_MIME_TYPES
      : ALLOWED_DOCUMENT_MIME_TYPES;

    if (!allowedMimeTypes.has(contentType)) {
      return NextResponse.json(
        {
          error: isHeadshot
            ? "Headshot must be a JPG or PNG image."
            : "Document must be a PDF, JPG or PNG file.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(size) ||
      size <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid file size." },
        { status: 400 }
      );
    }

    const maxSize = isHeadshot
      ? MAX_HEADSHOT_SIZE
      : MAX_DOCUMENT_SIZE;

    if (size > maxSize) {
      return NextResponse.json(
        {
          error: isHeadshot
            ? "Headshot is too large. Maximum size is 5 MB."
            : "Document is too large. Maximum size is 10 MB.",
        },
        { status: 400 }
      );
    }

    const application =
      await prisma.showcaseApplication.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
        },
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
        ?.toLowerCase() ||
      (isHeadshot ? "jpg" : "pdf");

    const folder =
      documentType.toLowerCase();

    const storageKey =
      `showcase-applications/${id}/identity/` +
      `${folder}/` +
      `${crypto.randomUUID()}.${extension}`;

    /*
     * Each application has one active record for
     * PASSPORT, NIN and HEADSHOT.
     *
     * Re-uploading replaces the stored metadata
     * on the existing record.
     */
    const existing =
      await prisma.showcaseIdentityDocument.findUnique({
        where: {
          applicationId_type: {
            applicationId: id,
            type: documentType as
              | "PASSPORT"
              | "NIN"
              | "HEADSHOT",
          },
        },
      });

    let document;

    if (existing) {
      document =
        await prisma.showcaseIdentityDocument.update({
          where: {
            id: existing.id,
          },
          data: {
            status: "UPLOADED",
            storageProvider: "CLOUDFLARE_R2",
            storageKey,
            originalFilename: filename,
            mimeType: contentType,
            sizeBytes: BigInt(size),
            uploadedAt: null,
            verifiedAt: null,
            verifiedBy: null,
            reviewNotes: null,
          },
        });
    } else {
      document =
        await prisma.showcaseIdentityDocument.create({
          data: {
            applicationId: id,
            type: documentType as
              | "PASSPORT"
              | "NIN"
              | "HEADSHOT",
            status: "UPLOADED",
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
      documentId: document.id,
    });
  } catch (error) {
    console.error(
      "SHOWCASE IDENTITY PRESIGN ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to prepare the identity document upload.",
      },
      { status: 500 }
    );
  }
}
