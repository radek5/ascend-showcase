"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireStaffAdmin } from "@/lib/staff/auth";

function optionalDate(value: FormDataEntryValue | null) {
  const raw = String(value || "").trim();

  if (!raw) {
    return null;
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid event date.");
  }

  return date;
}

export async function createEvent(formData: FormData) {
  await requireStaffAdmin();

  const name = String(
    formData.get("name") || "",
  ).trim();

  const edition = String(
    formData.get("edition") || "",
  ).trim();

  const slug = String(
    formData.get("slug") || "",
  )
    .trim()
    .toLowerCase();

  const city = String(
    formData.get("city") || "",
  ).trim();

  const country = String(
    formData.get("country") || "",
  ).trim();

  const venue = String(
    formData.get("venue") || "",
  ).trim();

  const registrationVenue = String(
    formData.get("registrationVenue") || "",
  ).trim();

  const capacityRaw = String(
    formData.get("capacity") || "",
  ).trim();

  const feeRaw = String(
    formData.get("registrationFeeAmount") || "",
  ).trim();

  const registrationFeeCurrency = String(
    formData.get("registrationFeeCurrency") || "NGN",
  )
    .trim()
    .toUpperCase();

  if (
    !name ||
    !edition ||
    !slug ||
    !city ||
    !country ||
    !venue
  ) {
    throw new Error(
      "Name, edition, slug, city, country and venue are required.",
    );
  }

  const capacity =
    capacityRaw
      ? Number.parseInt(capacityRaw, 10)
      : null;

  const feeMajor =
    feeRaw
      ? Number.parseFloat(feeRaw)
      : null;

  if (
    capacity !== null &&
    (!Number.isFinite(capacity) ||
      capacity <= 0)
  ) {
    throw new Error("Invalid event capacity.");
  }

  if (
    feeMajor !== null &&
    (!Number.isFinite(feeMajor) ||
      feeMajor < 0)
  ) {
    throw new Error("Invalid registration fee.");
  }

  const registrationFeeAmount =
    feeMajor !== null
      ? Math.round(feeMajor * 100)
      : null;

  await prisma.event.create({
    data: {
      name,
      edition,
      slug,
      city,
      country,
      venue,

      registrationVenue:
        registrationVenue || null,

      registrationStartsAt:
        optionalDate(
          formData.get("registrationStartsAt"),
        ),

      registrationEndsAt:
        optionalDate(
          formData.get("registrationEndsAt"),
        ),

      footballStartsAt:
        optionalDate(
          formData.get("footballStartsAt"),
        ),

      footballEndsAt:
        optionalDate(
          formData.get("footballEndsAt"),
        ),

      capacity,

      registrationFeeAmount,
      registrationFeeCurrency,

      registrationOpen: false,
      active: false,
    },
  });

  revalidatePath("/staff/events");
}

export async function setActiveEvent(
  formData: FormData,
) {
  await requireStaffAdmin();

  const eventId = String(
    formData.get("eventId") || "",
  ).trim();

  if (!eventId) {
    throw new Error("Event ID missing.");
  }

  await prisma.$transaction([
    prisma.event.updateMany({
      data: {
        active: false,
      },
    }),

    prisma.event.update({
      where: {
        id: eventId,
      },

      data: {
        active: true,
      },
    }),
  ]);

  revalidatePath("/staff/events");
  revalidatePath("/staff/dashboard");
  revalidatePath("/staff/checkin");
}

export async function toggleRegistrationOpen(
  formData: FormData,
) {
  await requireStaffAdmin();

  const eventId = String(
    formData.get("eventId") || "",
  ).trim();

  const currentlyOpen =
    String(
      formData.get("currentlyOpen") || "",
    ) === "true";

  if (!eventId) {
    throw new Error("Event ID missing.");
  }

  await prisma.event.update({
    where: {
      id: eventId,
    },

    data: {
      registrationOpen:
        !currentlyOpen,
    },
  });

  revalidatePath("/staff/events");
  revalidatePath("/");
}
