"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

export async function checkInShowcasePlayer(formData: FormData) {
  const staffUser = await requireStaffUser();

  const token = String(formData.get("token") || "").trim();

  if (!token) {
    throw new Error("Check-in token missing.");
  }

  const application = await prisma.showcaseApplication.findUnique({
    where: {
      checkInToken: token,
    },

    select: {
      id: true,
      status: true,
      checkedInAt: true,
    },
  });

  if (!application) {
    throw new Error("Showcase player credential not found.");
  }

  /*
   * A private check-in token may exist before selection,
   * but event entry is only valid once the application
   * has reached the final SELECTED state.
   */
  if (application.status !== "SELECTED") {
    throw new Error(
      "This player is not currently authorised for showcase event check-in.",
    );
  }

  /*
   * Idempotent:
   * scanning or confirming the same credential twice
   * must not create a second check-in event.
   */
  if (!application.checkedInAt) {
    await prisma.showcaseApplication.update({
      where: {
        id: application.id,
      },

      data: {
        checkedInAt: new Date(),
        checkedInByStaffUserId: staffUser.id,
      },
    });
  }

  revalidatePath(`/showcase-checkin/${token}`);
  revalidatePath("/staff/checkin");
  revalidatePath("/staff/selection");
}
