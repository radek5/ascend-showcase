export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;
    const body = await req.json();

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

    const isUnder18 =
      typeof application.age === "number" &&
      application.age < 18;

    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();

    const guardianName = String(
      body.guardianName || ""
    ).trim();

    const guardianRelationship = String(
      body.guardianRelationship || ""
    ).trim();

    const guardianEmail = String(
      body.guardianEmail || ""
    ).trim();

    const guardianPhone = String(
      body.guardianPhone || ""
    ).trim();

    const emergencyContactName = String(
      body.emergencyContactName || ""
    ).trim();

    const emergencyContactRelationship = String(
      body.emergencyContactRelationship || ""
    ).trim();

    const emergencyContactPhone = String(
      body.emergencyContactPhone || ""
    ).trim();

    if (!isUnder18 && (!email || !phone)) {
      return NextResponse.json(
        {
          error:
            "Email and phone / WhatsApp are required.",
        },
        { status: 400 }
      );
    }

    if (
      isUnder18 &&
      (!guardianName ||
        !guardianRelationship ||
        !guardianEmail ||
        !guardianPhone)
    ) {
      return NextResponse.json(
        {
          error:
            "Parent or guardian details are required for players under 18.",
        },
        { status: 400 }
      );
    }

    if (
      !emergencyContactName ||
      !emergencyContactRelationship ||
      !emergencyContactPhone
    ) {
      return NextResponse.json(
        {
          error:
            "Emergency contact details are required.",
        },
        { status: 400 }
      );
    }

    await prisma.showcaseApplication.update({
      where: { id },
      data: {
        email: email || application.email,
        phone: phone || null,

        guardianName:
          guardianName || null,
        guardianRelationship:
          guardianRelationship || null,
        guardianEmail:
          guardianEmail || null,
        guardianPhone:
          guardianPhone || null,

        emergencyContactName,
        emergencyContactRelationship,
        emergencyContactPhone,
      },
    });

    return NextResponse.json({
      success: true,
      next: `/apply/lagos-2027/${id}/representation`,
    });
  } catch (error) {
    console.error(
      "UPDATE SHOWCASE CONTACT ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "We could not save the contact information.",
      },
      { status: 500 }
    );
  }
}
