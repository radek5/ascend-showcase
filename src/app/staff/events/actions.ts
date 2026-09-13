"use server";

import { revalidatePath } from "next/cache";

import { ShowcaseCompetitionCategory } from "@/generated/prisma/client";
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

  const reserveCapacityRaw = String(
    formData.get("reserveCapacity") || "",
  ).trim();

  const feeRaw = String(
    formData.get("registrationFeeAmount") || "",
  ).trim();

  const registrationFeeCurrency = String(
    formData.get("registrationFeeCurrency") || "NGN",
  )
    .trim()
    .toUpperCase();

  const showcaseCompetitionCategoryRaw = String(
    formData.get("showcaseCompetitionCategory") || "OPEN",
  )
    .trim()
    .toUpperCase();

  const showcaseMinimumAgeRaw = String(
    formData.get("showcaseMinimumAge") || "",
  ).trim();

  const showcaseMaximumAgeRaw = String(
    formData.get("showcaseMaximumAge") || "",
  ).trim();

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

  const reserveCapacity =
    reserveCapacityRaw
      ? Number.parseInt(reserveCapacityRaw, 10)
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
    reserveCapacity !== null &&
    (!Number.isFinite(reserveCapacity) ||
      reserveCapacity <= 0)
  ) {
    throw new Error("Invalid reserve-list capacity.");
  }

  if (
    feeMajor !== null &&
    (!Number.isFinite(feeMajor) ||
      feeMajor < 0)
  ) {
    throw new Error("Invalid registration fee.");
  }

  const showcaseMinimumAge =
    showcaseMinimumAgeRaw
      ? Number.parseInt(showcaseMinimumAgeRaw, 10)
      : null;

  const showcaseMaximumAge =
    showcaseMaximumAgeRaw
      ? Number.parseInt(showcaseMaximumAgeRaw, 10)
      : null;

 if (
  !Object.values(ShowcaseCompetitionCategory).includes(
    showcaseCompetitionCategoryRaw as ShowcaseCompetitionCategory,
  )
) {
  throw new Error(
    "Invalid showcase competition category.",
  );
}

const showcaseCompetitionCategory =
  showcaseCompetitionCategoryRaw as ShowcaseCompetitionCategory;

  if (
    showcaseMinimumAge !== null &&
    (!Number.isInteger(showcaseMinimumAge) ||
      showcaseMinimumAge <= 0)
  ) {
    throw new Error(
      "Invalid minimum showcase age.",
    );
  }

  if (
    showcaseMaximumAge !== null &&
    (!Number.isInteger(showcaseMaximumAge) ||
      showcaseMaximumAge <= 0)
  ) {
    throw new Error(
      "Invalid maximum showcase age.",
    );
  }

  if (
    showcaseMinimumAge !== null &&
    showcaseMaximumAge !== null &&
    showcaseMinimumAge > showcaseMaximumAge
  ) {
    throw new Error(
      "Minimum showcase age cannot exceed maximum showcase age.",
    );
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
      showcaseCompetitionCategory,

      showcaseMinimumAge,
      showcaseMaximumAge,
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
      reserveCapacity,

      registrationFeeAmount,
      registrationFeeCurrency,

      registrationOpen: false,
      active: false,
    },
  });

  revalidatePath("/staff/events");
}

export async function updateEvent(formData: FormData) {
  await requireStaffAdmin();

  const eventId = String(
    formData.get("eventId") || "",
  ).trim();

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

  const reserveCapacityRaw = String(
    formData.get("reserveCapacity") || "",
  ).trim();

  const feeRaw = String(
    formData.get("registrationFeeAmount") || "",
  ).trim();

  const registrationFeeCurrency = String(
    formData.get("registrationFeeCurrency") || "NGN",
  )
    .trim()
    .toUpperCase();

  const showcaseCompetitionCategoryRaw = String(
    formData.get("showcaseCompetitionCategory") || "OPEN",
  )
    .trim()
    .toUpperCase();

  const showcaseMinimumAgeRaw = String(
    formData.get("showcaseMinimumAge") || "",
  ).trim();

  const showcaseMaximumAgeRaw = String(
    formData.get("showcaseMaximumAge") || "",
  ).trim();

  if (
    !eventId ||
    !name ||
    !edition ||
    !slug ||
    !city ||
    !country ||
    !venue
  ) {
    throw new Error(
      "Event ID, name, edition, slug, city, country and venue are required.",
    );
  }

  const capacity =
    capacityRaw
      ? Number.parseInt(capacityRaw, 10)
      : null;

  const reserveCapacity =
    reserveCapacityRaw
      ? Number.parseInt(reserveCapacityRaw, 10)
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
    reserveCapacity !== null &&
    (!Number.isFinite(reserveCapacity) ||
      reserveCapacity <= 0)
  ) {
    throw new Error("Invalid reserve-list capacity.");
  }

  if (
    feeMajor !== null &&
    (!Number.isFinite(feeMajor) ||
      feeMajor < 0)
  ) {
    throw new Error("Invalid registration fee.");
  }

  const showcaseMinimumAge =
    showcaseMinimumAgeRaw
      ? Number.parseInt(showcaseMinimumAgeRaw, 10)
      : null;

  const showcaseMaximumAge =
    showcaseMaximumAgeRaw
      ? Number.parseInt(showcaseMaximumAgeRaw, 10)
      : null;

  if (
    !Object.values(ShowcaseCompetitionCategory).includes(
      showcaseCompetitionCategoryRaw as ShowcaseCompetitionCategory,
    )
  ) {
    throw new Error(
      "Invalid showcase competition category.",
    );
  }

  const showcaseCompetitionCategory =
    showcaseCompetitionCategoryRaw as ShowcaseCompetitionCategory;

  if (
    showcaseMinimumAge !== null &&
    (!Number.isInteger(showcaseMinimumAge) ||
      showcaseMinimumAge <= 0)
  ) {
    throw new Error(
      "Invalid minimum showcase age.",
    );
  }

  if (
    showcaseMaximumAge !== null &&
    (!Number.isInteger(showcaseMaximumAge) ||
      showcaseMaximumAge <= 0)
  ) {
    throw new Error(
      "Invalid maximum showcase age.",
    );
  }

  if (
    showcaseMinimumAge !== null &&
    showcaseMaximumAge !== null &&
    showcaseMinimumAge > showcaseMaximumAge
  ) {
    throw new Error(
      "Minimum showcase age cannot exceed maximum showcase age.",
    );
  }

  const registrationFeeAmount =
    feeMajor !== null
      ? Math.round(feeMajor * 100)
      : null;

  await prisma.event.update({
    where: {
      id: eventId,
    },
    data: {
      name,
      edition,
      slug,
      city,
      country,
      venue,

      showcaseCompetitionCategory,
      showcaseMinimumAge,
      showcaseMaximumAge,

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
      reserveCapacity,

      registrationFeeAmount,
      registrationFeeCurrency,
    },
  });

  revalidatePath("/staff/events");
  revalidatePath("/staff/dashboard");
  revalidatePath("/staff/checkin");
  revalidatePath("/staff/selection");
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
