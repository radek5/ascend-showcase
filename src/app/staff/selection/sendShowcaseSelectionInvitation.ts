"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { sendShowcaseSelectionInvitation as sendSelectionInvitationEmail } from "@/lib/email/sendShowcaseSelectionInvitation";
import { requireStaffAdmin } from "@/lib/staff/auth";

export async function sendShowcaseSelectionInvitation(
  applicationId: string,
  force = false,
) {
  await requireStaffAdmin();

  const application =
    await prisma.showcaseApplication.findUnique({
      where: {
        id: applicationId,
      },

      select: {
        id: true,
        eventSlug: true,
        status: true,
        selectedAt: true,
        selectionDecisionReleasedAt: true,
        registrationNumber: true,
        checkInToken: true,
        selectionInvitationSentAt: true,
      },
    });

  if (!application) {
    throw new Error(
      "Showcase application not found.",
    );
  }

  const event = await prisma.event.findUnique({
  where: {
    slug: application.eventSlug,
  },

  select: {
    selectionDecisionsReleasedAt: true,
  },
});

if (!event) {
  throw new Error(
    "Showcase event not found.",
  );
}

if (
  !event.selectionDecisionsReleasedAt ||
  !application.selectionDecisionReleasedAt
) {
  throw new Error(
    "Selection decisions must be formally released before a selection invitation can be sent.",
  );
}

  if (application.status !== "SELECTED") {
    throw new Error(
      "Only selected players can receive a selection invitation.",
    );
  }

  if (!application.selectedAt) {
    throw new Error(
      "Cannot send a selection invitation before the player has been selected.",
    );
  }

  if (!application.registrationNumber) {
    throw new Error(
      "Cannot send a selection invitation without a registration number.",
    );
  }

  if (!application.checkInToken) {
    throw new Error(
      "Cannot send a selection invitation without an event credential.",
    );
  }

  if (
    application.selectionInvitationSentAt &&
    !force
  ) {
    return {
      sent: false,
      alreadySent: true,
    };
  }

  const result =
    await sendSelectionInvitationEmail({
      applicationId: application.id,
      force,
    });

  revalidatePath("/staff/selection");

  return {
    sent: true,
    alreadySent: false,
    recipientEmail: result.recipientEmail,
    messageId: result.messageId,
  };
}
