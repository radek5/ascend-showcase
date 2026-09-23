"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { checkProfessionalRegistrationAccess } from "@/lib/professionals/registrationOwnership";
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

const ALLOWED_ROLES = [
  "CLUB_REPRESENTATIVE",
  "SCOUT",
  "FOOTBALL_AGENT",
] as const;

type ProfessionalRole =
  (typeof ALLOWED_ROLES)[number];

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

export async function updateProfessionalRegistrationDetails(
  formData: FormData,
) {
  const registrationId = String(
    formData.get("registrationId") || "",
  ).trim();

  const role = String(
    formData.get("role") || "",
  ).trim();

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

  if (!registrationId) {
    throw new Error(
      "Professional registration ID missing.",
    );
  }

  if (
    !ALLOWED_ROLES.includes(
      role as ProfessionalRole,
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

  const access =
    await checkProfessionalRegistrationAccess(
      registrationId,
    );

  if (!access.authorised) {
    throw new Error(
      "Professional registration not found or not authorised.",
    );
  }

  if (access.status !== "DRAFT") {
    throw new Error(
      "This professional registration has already been submitted.",
    );
  }

  const replacementHeadshot =
    headshot instanceof File &&
    headshot.size > 0
      ? headshot
      : null;

  let replacementStorageKey: string | null = null;

  if (replacementHeadshot) {
    if (
      !ALLOWED_TYPES.includes(
        replacementHeadshot.type,
      )
    ) {
      throw new Error(
        "Headshot must be JPG, PNG or WebP.",
      );
    }

    if (
      replacementHeadshot.size >
      MAX_HEADSHOT_SIZE
    ) {
      throw new Error(
        "Headshot must be 5MB or smaller.",
      );
    }

    const event = await prisma.event.findUnique({
      where: {
        slug: "lagos-2027",
      },
      select: {
        slug: true,
      },
    });

    if (!event) {
      throw new Error(
        "Active REVELATIONX1 Showcase event not found.",
      );
    }

    const extension =
      getExtension(replacementHeadshot);

    replacementStorageKey =
      `professional-headshots/` +
      `${event.slug}/` +
      `${registrationId}-${crypto.randomUUID()}.${extension}`;

    const bytes =
      await replacementHeadshot.arrayBuffer();

    try {
      await r2.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: replacementStorageKey,
          Body: Buffer.from(bytes),
          ContentType: replacementHeadshot.type,
        }),
      );
    } catch (error) {
      console.error(
        "Professional replacement headshot upload failed:",
        error,
      );

      throw new Error(
        "Unable to upload the headshot. Please try again.",
      );
    }
  }

  const update =
    await prisma.professionalRegistration.updateMany({
      where: {
        id: registrationId,
        status: "DRAFT",
      },
      data: {
        role: role as ProfessionalRole,
        fullName,
        email,
        phone,
        ...(replacementStorageKey
          ? {
              headshotUrl:
                replacementStorageKey,
            }
          : {}),
      },
    });

  if (update.count !== 1) {
    throw new Error(
      "This professional registration can no longer be changed.",
    );
  }

  redirect(
    `/professional-registration/travel?registration=${registrationId}`,
  );
}
