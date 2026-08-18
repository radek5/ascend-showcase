import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireStaffAdmin } from "@/lib/staff/auth";

export async function POST(request: Request) {
  await requireStaffAdmin();

  const formData = await request.formData();

  const id = String(
    formData.get("id") || "",
  ).trim();

  if (!id) {
    return NextResponse.json(
      {
        error: "Player registration ID missing.",
      },
      {
        status: 400,
      },
    );
  }

  const registration =
    await prisma.registration.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        archivedAt: true,
      },
    });

  if (!registration) {
    return NextResponse.json(
      {
        error: "Player registration not found.",
      },
      {
        status: 404,
      },
    );
  }

  if (!registration.archivedAt) {
    return NextResponse.json(
      {
        error:
          "Only archived player registrations can be permanently deleted.",
      },
      {
        status: 409,
      },
    );
  }

  await prisma.$transaction([
    // Formal introductions referencing the player
    prisma.introduction.deleteMany({
      where: {
        registrationId: id,
      },
    }),

    // Scout interest records
    prisma.scoutInterest.deleteMany({
      where: {
        registrationId: id,
      },
    }),

    // Player assessment
    prisma.playerAssessment.deleteMany({
      where: {
        registrationId: id,
      },
    }),

    // Representation audit/history
    prisma.representationHistory.deleteMany({
      where: {
        registrationId: id,
      },
    }),

    // Representation declaration
    prisma.representationDeclaration.deleteMany({
      where: {
        registrationId: id,
      },
    }),

    // Uploaded/submitted video database records
    prisma.playerVideo.deleteMany({
      where: {
        registrationId: id,
      },
    }),

    // Payment database records
    prisma.payment.deleteMany({
      where: {
        registrationId: id,
      },
    }),

    // Finally remove the registration itself
    prisma.registration.delete({
      where: {
        id,
      },
    }),
  ]);

  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host");

  const protocol =
    request.headers.get("x-forwarded-proto") ||
    "http";

  if (!host) {
    throw new Error(
      "Unable to determine application host.",
    );
  }

  return NextResponse.redirect(
    new URL(
      "/staff/archive",
      `${protocol}://${host}`,
    ),
    303,
  );
}
