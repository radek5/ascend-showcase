"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function updateVideo(formData: FormData) {
  const registrationId = String(
    formData.get("registrationId") || "",
  ).trim();

  const videoLink = String(
    formData.get("videoLink") || "",
  ).trim();

  if (!registrationId) {
    throw new Error("Registration ID missing.");
  }

  const registration = await prisma.registration.findUnique({
    where: {
      id: registrationId,
    },
  });

  if (!registration) {
    throw new Error("Registration not found.");
  }

  if (videoLink) {
    try {
      new URL(videoLink);
    } catch {
      throw new Error("Please enter a valid video URL.");
    }

    const existingVideo = await prisma.playerVideo.findFirst({
      where: {
        registrationId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (existingVideo) {
      await prisma.playerVideo.update({
        where: {
          id: existingVideo.id,
        },
        data: {
          status: "SUBMITTED",
          sourceType: "EXTERNAL_LINK",
          externalUrl: videoLink,
          submittedAt: new Date(),
        },
      });
    } else {
      await prisma.playerVideo.create({
        data: {
          registrationId,
          status: "SUBMITTED",
          sourceType: "EXTERNAL_LINK",
          externalUrl: videoLink,
          submittedAt: new Date(),
        },
      });
    }
  }

  await prisma.registration.update({
    where: {
      id: registrationId,
    },
    data: {
      currentStep: "MEDICAL_CONSENT",
    },
  });

  redirect(
    `/register/medical-consent?registration=${registrationId}`,
  );
}
