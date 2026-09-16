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
      eventSlug: true,
      status: true,
      selectionDecisionReleasedAt: true,
      selectionResponse: true,
      checkedInAt: true,

      selectedPlayerConfirmation: {
        select: {
          confirmedAt: true,
        },
      },
    },
  });

  if (!application) {
    throw new Error("Showcase player credential not found.");
  }

  const event = await prisma.event.findUnique({
    where: {
      slug: application.eventSlug,
    },

    select: {
      selectionDecisionsReleasedAt: true,
    },
  });

  if (
    !event?.selectionDecisionsReleasedAt ||
    !application.selectionDecisionReleasedAt ||
    application.status !== "SELECTED" ||
    application.selectionResponse !== "ACCEPTED" ||
    !application.selectedPlayerConfirmation?.confirmedAt
  ) {
    throw new Error(
      "This player does not currently have a valid Lagos 2027 event credential.",
    );
  }

  /*
   * The private token may exist before credential eligibility.
   * Possession of the token alone never authorises event entry.
   *
   * The mutation below repeats the mutable eligibility conditions
   * so a concurrent response/status change cannot check in a player
   * who is no longer credential-eligible.
   */
  if (!application.checkedInAt) {
    const result = await prisma.showcaseApplication.updateMany({
      where: {
        id: application.id,
        status: "SELECTED",
        selectionDecisionReleasedAt: {
          not: null,
        },
        selectionResponse: "ACCEPTED",
        checkedInAt: null,

        selectedPlayerConfirmation: {
          is: {
            confirmedAt: {
              not: null,
            },
          },
        },
      },

      data: {
        checkedInAt: new Date(),
        checkedInByStaffUserId: staffUser.id,
      },
    });

    if (result.count !== 1) {
      throw new Error(
        "This player could not be checked in because their credential eligibility has changed.",
      );
    }
  }

  revalidatePath(`/showcase-checkin/${token}`);
  revalidatePath("/staff/checkin");
  revalidatePath("/staff/selection");
}
