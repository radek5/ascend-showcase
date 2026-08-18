import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentStaffUser } from "@/lib/staff/auth";

export async function POST(
  request: Request,
  context: {
    params: Promise<{ token: string }>;
  },
) {
  const { token } = await context.params;

  //
  // Server-side security check.
  // Hiding the button in the UI is NOT enough.
  //
  const staffUser =
    await getCurrentStaffUser();

  if (!staffUser) {
    const host =
      request.headers.get("x-forwarded-host") ||
      request.headers.get("host");

    const protocol =
      request.headers.get("x-forwarded-proto") ||
      "http";

    if (!host) {
      return NextResponse.json(
        {
          error: "ASCEND staff authentication required.",
        },
        {
          status: 401,
        },
      );
    }

    return NextResponse.redirect(
      new URL(
        "/staff/login",
        `${protocol}://${host}`,
      ),
      303,
    );
  }

  const registration =
    await prisma.professionalRegistration.findUnique({
      where: {
        checkInToken: token,
      },
    });

  if (!registration) {
    return NextResponse.json(
      {
        error:
          "Professional accreditation not found.",
      },
      {
        status: 404,
      },
    );
  }

  if (
    registration.status !== "ACCREDITED" &&
    registration.status !== "CHECKED_IN"
  ) {
    return NextResponse.json(
      {
        error:
          "This professional registration is not valid for event check-in.",
      },
      {
        status: 403,
      },
    );
  }

  //
  // Idempotent check-in.
  // Re-scanning cannot create a second check-in.
  //
  if (!registration.checkedInAt) {
    await prisma.professionalRegistration.update({
      where: {
        id: registration.id,
      },

      data: {
        status: "CHECKED_IN",
        checkedInAt: new Date(),
        checkedInByStaffUserId: staffUser.id,
      },
    });
  }

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
      `/professional-checkin/${token}`,
      `${protocol}://${host}`,
    ),
    303,
  );
}
