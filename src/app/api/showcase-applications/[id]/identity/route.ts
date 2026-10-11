export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import {
  checkApplicantApplicationAccess,
  getApplicantApplicationAccessError,
} from "@/lib/applicants/applicationOwnership";

import { getNinLast4, hashNin, validateNin } from "@/lib/showcase/ninIdentity";

export async function GET(
  _request: Request,
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

    const application = await prisma.showcaseApplication.findUnique({
      where: {
        id: access.applicationId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        age: true,
        eventSlug: true,
        status: true,
        ninLast4: true,

        identityDocuments: {
          select: {
            id: true,
            type: true,
            governmentIdType: true,
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
        { status: 404 },
      );
    }

    return NextResponse.json({
      application: {
        ...application,

        identityDocuments: application.identityDocuments.map((document) => ({
          ...document,
          sizeBytes: document.sizeBytes?.toString() ?? null,
        })),
      },
    });
  } catch (error) {
    console.error("GET SHOWCASE IDENTITY ERROR", error);

    return NextResponse.json(
      {
        error: "Unable to load identity verification information.",
      },
      { status: 500 },
    );
  }
}

export async function PUT(
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
          error:
            "This application has already been submitted and identity information can no longer be changed.",
          code: "APPLICATION_ALREADY_SUBMITTED",
        },
        { status: 409 },
      );
    }

    const body = await request.json();

    const rawNin = String(body.nin || "").trim();

    let nin: string;

    try {
      nin = validateNin(rawNin);
    } catch (error) {
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : "Invalid NIN.",
        },
        { status: 400 },
      );
    }

    const ninHash = hashNin(nin);
    const ninLast4 = getNinLast4(nin);

    const application = await prisma.showcaseApplication.findUnique({
      where: {
        id: access.applicationId,
      },
      select: {
        id: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        {
          error: "Application not found.",
        },
        { status: 404 },
      );
    }

    await prisma.showcaseApplication.update({
      where: {
        id: application.id,
      },
      data: {
        ninHash,
        ninLast4,
      },
    });

    return NextResponse.json({
      success: true,
      ninLast4,
    });
  } catch (error) {
    console.error("UPDATE SHOWCASE NIN ERROR", error);

    return NextResponse.json(
      {
        error: "We could not save the NIN information.",
      },
      { status: 500 },
    );
  }
}
