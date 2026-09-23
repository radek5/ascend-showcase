import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentStaffUser } from "@/lib/staff/auth";
import {
  checkProfessionalRegistrationAccess,
  getProfessionalRegistrationAccessError,
} from "@/lib/professionals/registrationOwnership";
import {
  r2,
  R2_BUCKET_NAME,
} from "@/lib/storage/r2";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const staffUser =
    await getCurrentStaffUser();

  if (!staffUser) {
    const access =
      await checkProfessionalRegistrationAccess(id);

    if (!access.authorised) {
      const error =
        getProfessionalRegistrationAccessError(access);

      return NextResponse.json(
        {
          error: error.error,
          code: error.code,
        },
        {
          status: error.status,
        },
      );
    }
  }

  const registration =
    await prisma.professionalRegistration.findUnique({
      where: { id },
      select: {
        headshotUrl: true,
      },
    });

  if (!registration?.headshotUrl) {
    return NextResponse.json(
      { error: "Headshot not found." },
      { status: 404 },
    );
  }

  try {
    const object = await r2.send(
      new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: registration.headshotUrl,
      }),
    );

    if (!object.Body) {
      return NextResponse.json(
        { error: "Headshot unavailable." },
        { status: 404 },
      );
    }

   const bytes = await object.Body.transformToByteArray();

const body = new Uint8Array(bytes).buffer;

return new NextResponse(body, {
  headers: {
    "Content-Type":
      object.ContentType || "image/jpeg",
    "Cache-Control": "private, max-age=300",
  },
});
  } catch (error) {
    console.error(
      "Unable to load professional headshot:",
      error,
    );

    return NextResponse.json(
      { error: "Unable to load headshot." },
      { status: 500 },
    );
  }
}
