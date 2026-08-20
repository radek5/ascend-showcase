"use server";

import crypto from "node:crypto";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  r2,
  R2_BUCKET_NAME,
} from "@/lib/storage/r2";

const ALLOWED_HEADSHOT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_HEADSHOT_SIZE =
  5 * 1024 * 1024; // 5 MB

export async function createRegistration(
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

  const firstName = String(
    formData.get("firstName") || "",
  ).trim();

  const lastName = String(
    formData.get("lastName") || "",
  ).trim();

  const dateOfBirth = String(
    formData.get("dateOfBirth") || "",
  );

  const nationality = String(
    formData.get("nationality") || "",
  ).trim();

  const primaryPosition = String(
    formData.get("primaryPosition") || "",
  ).trim();

  const preferredFoot = String(
    formData.get("preferredFoot") || "",
  ).trim();

  const currentClub = String(
    formData.get("currentClub") || "",
  ).trim();

  const headshot =
    formData.get("headshot");

  if (
    !firstName ||
    !lastName ||
    !dateOfBirth ||
    !nationality ||
    !primaryPosition ||
    !preferredFoot
  ) {
    throw new Error(
      "Please complete all required player details.",
    );
  }

  if (
    !(headshot instanceof File) ||
    headshot.size === 0
  ) {
    throw new Error(
      "Please upload a player headshot.",
    );
  }

  if (
    !ALLOWED_HEADSHOT_TYPES.has(
      headshot.type,
    )
  ) {
    throw new Error(
      "Player headshot must be JPG, PNG or WebP.",
    );
  }

  if (
    headshot.size > MAX_HEADSHOT_SIZE
  ) {
    throw new Error(
      "Player headshot must be 5 MB or smaller.",
    );
  }

  /*
   * Create the registration first so the
   * R2 object can live under its permanent ID.
   */
  const registration =
    await prisma.registration.create({
      data: {
        eventId: event.id,
        status: "DRAFT",
        currentStep: "CONTACT",

        firstName,
        lastName,
        dateOfBirth:
          new Date(dateOfBirth),
        nationality,
        primaryPosition,
        preferredFoot,
        currentClub:
          currentClub || null,
      },
    });

  try {
    const extension =
      headshot.name
        .split(".")
        .pop()
        ?.toLowerCase() ||
      headshot.type.split("/")[1] ||
      "jpg";

    const storageKey =
      `registrations/${registration.id}/headshot/` +
      `${crypto.randomUUID()}.${extension}`;

    const bytes =
      Buffer.from(
        await headshot.arrayBuffer(),
      );

    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: storageKey,
        Body: bytes,
        ContentType:
          headshot.type,
      }),
    );

    await prisma.registration.update({
      where: {
        id: registration.id,
      },
      data: {
        headshotUrl:
          storageKey,
      },
    });
  } catch (error) {
    /*
     * Do not leave a half-created
     * registration if the mandatory
     * headshot cannot be saved.
     */
    await prisma.registration.delete({
      where: {
        id: registration.id,
      },
    });

    console.error(
      "Unable to save player headshot:",
      error,
    );

    throw new Error(
      "Unable to save the player headshot. Please try again.",
    );
  }

  redirect(
    `/register/contact?registration=${registration.id}`,
  );
}
