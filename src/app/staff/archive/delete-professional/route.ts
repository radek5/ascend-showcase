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
        error: "Professional registration ID missing.",
      },
      {
        status: 400,
      },
    );
  }

  const registration =
    await prisma.professionalRegistration.findUnique({
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
        error: "Professional registration not found.",
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
          "Only archived professional registrations can be permanently deleted.",
      },
      {
        status: 409,
      },
    );
  }

  await prisma.professionalRegistration.delete({
    where: {
      id,
    },
  });

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
