export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";

import {
  checkApplicantApplicationAccess,
  getApplicantApplicationAccessError,
} from "@/lib/applicants/applicationOwnership";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
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
    });

    if (!application) {
      return NextResponse.json(
        {
          error: "Application not found.",
          code: "APPLICATION_NOT_FOUND",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("GET SHOWCASE APPLICATION ERROR", error);

    return NextResponse.json(
      { error: "Unable to load application." },
      { status: 500 },
    );
  }
}
