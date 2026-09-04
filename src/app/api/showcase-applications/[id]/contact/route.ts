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
  },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const application = await prisma.showcaseApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json(
        {
          error: "Application not found.",
        },
        { status: 404 },
      );
    }

    const email = String(body.email || "").trim();

    const phone = String(body.phone || "").trim();

    const stateRegion = String(body.stateRegion || "").trim();
    const city = String(body.city || "").trim();

    const emergencyContactName = String(body.emergencyContactName || "").trim();

    const emergencyContactRelationship = String(
      body.emergencyContactRelationship || "",
    ).trim();

    const emergencyContactPhone = String(
      body.emergencyContactPhone || "",
    ).trim();

    if (!email || !phone) {
      return NextResponse.json(
        {
          error: "Email and phone / WhatsApp are required.",
        },
        { status: 400 },
      );
    }

    if (!stateRegion || !city) {
      return NextResponse.json(
        {
          error: "State / Region and City are required.",
        },
        { status: 400 },
      );
    }

    if (
      !emergencyContactName ||
      !emergencyContactRelationship ||
      !emergencyContactPhone
    ) {
      return NextResponse.json(
        {
          error: "Emergency contact details are required.",
        },
        { status: 400 },
      );
    }

    await prisma.showcaseApplication.update({
      where: { id },

      data: {
        email,
        phone,

        stateRegion,
        city,

        emergencyContactName,
        emergencyContactRelationship,
        emergencyContactPhone,
      },
    });

    return NextResponse.json({
      success: true,

      next: `/apply/lagos-2027/${id}/identity`,
    });
  } catch (error) {
    console.error("UPDATE SHOWCASE CONTACT ERROR", error);

    return NextResponse.json(
      {
        error: "We could not save the contact information.",
      },
      { status: 500 },
    );
  }
}
