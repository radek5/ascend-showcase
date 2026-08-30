import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";
import {
  createSelectorSession,
} from "@/lib/selectors/session";

function redirectUrl(
  request: NextRequest,
  pathname: string
) {
  const forwardedHost =
    request.headers.get("x-forwarded-host");

  const host =
    forwardedHost ||
    request.headers.get("host");

  const forwardedProto =
    request.headers.get("x-forwarded-proto");

  const protocol =
    forwardedProto ||
    (process.env.NODE_ENV === "production"
      ? "https"
      : "http");

  if (!host) {
    throw new Error(
      "Unable to determine application host."
    );
  }

  return new URL(
    pathname,
    `${protocol}://${host}`
  );
}

export async function GET(
  request: NextRequest
) {
  const staffUser =
    await requireStaffUser();

  const selector =
    await prisma.selectorAccount.findUnique({
      where: {
        staffUserId: staffUser.id,
      },
    });

  if (!selector || !selector.active) {
    return NextResponse.redirect(
      redirectUrl(
        request,
        "/staff/dashboard?error=selector-access-not-authorised"
      )
    );
  }

  await prisma.selectorAccount.update({
    where: {
      id: selector.id,
    },

    data: {
      lastLoginAt: new Date(),
    },
  });

  await createSelectorSession({
    selectorId: selector.id,
  });

  return NextResponse.redirect(
    redirectUrl(
      request,
      "/selectors"
    )
  );
}
