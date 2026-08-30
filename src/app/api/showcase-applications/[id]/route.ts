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
      });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error(
      "GET SHOWCASE APPLICATION ERROR",
      error
    );

    return NextResponse.json(
      { error: "Unable to load application." },
      { status: 500 }
    );
  }
}
