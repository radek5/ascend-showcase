"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  r2,
  R2_BUCKET_NAME,
} from "@/lib/storage/r2";

const MAX_HEADSHOT_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function getExtension(file: File) {
  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "bin";
  }
}

export async function createProfessionalRegistration(
  formData: FormData,
) {
  const event = await prisma.event.findUnique({
    where: {
      slug: "lagos-2027",
    },
  });

  if (!event) {
    throw new Error(
      "Active ASCEND Showcase event not found.",
    );
  }

  const role = String(formData.get("role") || "");
  const fullName = String(
    formData.get("fullName") || "",
  ).trim();
  const email = String(
    formData.get("email") || "",
  )
    .trim()
    .toLowerCase();
  const phone = String(
    formData.get("phone") || "",
  ).trim();

  const headshot = formData.get("headshot");

  const allowedRoles = [
    "CLUB_REPRESENTATIVE",
    "SCOUT",
    "FOOTBALL_AGENT",
  ] as const;

  if (
    !allowedRoles.includes(
      role as (typeof allowedRoles)[number],
    )
  ) {
    throw new Error(
      "Please select a valid professional role.",
    );
  }

  if (!fullName || !email || !phone) {
    throw new Error(
      "Please complete all required contact details.",
    );
  }

  if (
    !(headshot instanceof File) ||
    headshot.size === 0
  ) {
    throw new Error(
      "Please upload a headshot photo.",
    );
  }

  if (!ALLOWED_TYPES.includes(headshot.type)) {
    throw new Error(
      "Headshot must be JPG, PNG or WebP.",
    );
  }

  if (headshot.size > MAX_HEADSHOT_SIZE) {
    throw new Error(
      "Headshot must be 5MB or smaller.",
    );
  }

  //
  // Create the registration first so its ID can
  // become part of the permanent R2 object key.
  //
  const registration =
    await prisma.professionalRegistration.create({
      data: {
        eventId: event.id,
        status: "DRAFT",
        role:
          role as
            | "CLUB_REPRESENTATIVE"
            | "SCOUT"
            | "FOOTBALL_AGENT",
        fullName,
        email,
        phone,
      },
    });

  try {
    const extension = getExtension(headshot);

    const storageKey =
      `professional-headshots/` +
      `${event.slug}/` +
      `${registration.id}.${extension}`;

    const bytes = await headshot.arrayBuffer();

    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: storageKey,
        Body: Buffer.from(bytes),
        ContentType: headshot.type,
      }),
    );

    //
    // We deliberately store the R2 object key rather
    // than assuming the bucket is publicly accessible.
    //
    await prisma.professionalRegistration.update({
      where: {
        id: registration.id,
      },
      data: {
        headshotUrl: storageKey,
      },
    });
  } catch (error) {
    //
    // Avoid leaving an unusable DRAFT registration
    // behind if the required headshot upload fails.
    //
    await prisma.professionalRegistration.delete({
      where: {
        id: registration.id,
      },
    });

    console.error(
      "Professional headshot upload failed:",
      error,
    );

    throw new Error(
      "Unable to upload the headshot. Please try again.",
    );
  }

  redirect(
    `/professional-registration/travel?registration=${registration.id}`,
  );
}
