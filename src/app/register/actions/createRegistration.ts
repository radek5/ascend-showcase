"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function createRegistration(formData: FormData) {
  const event = await prisma.event.findUnique({
    where: {
      slug: "lagos-2027",
    },
  });

  if (!event) {
    throw new Error("Active ASCEND Showcase event not found.");
  }

  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const dateOfBirth = String(formData.get("dateOfBirth") || "");
  const nationality = String(formData.get("nationality") || "").trim();
  const primaryPosition = String(
    formData.get("primaryPosition") || "",
  ).trim();
  const preferredFoot = String(formData.get("preferredFoot") || "").trim();
  const currentClub = String(formData.get("currentClub") || "").trim();

  if (
    !firstName ||
    !lastName ||
    !dateOfBirth ||
    !nationality ||
    !primaryPosition ||
    !preferredFoot
  ) {
    throw new Error("Please complete all required player details.");
  }

  const registration = await prisma.registration.create({
    data: {
      eventId: event.id,
      status: "DRAFT",
      currentStep: "CONTACT",

      firstName,
      lastName,
      dateOfBirth: new Date(dateOfBirth),
      nationality,
      primaryPosition,
      preferredFoot,
      currentClub: currentClub || null,
    },
  });

  redirect(`/register/contact?registration=${registration.id}`);
}
