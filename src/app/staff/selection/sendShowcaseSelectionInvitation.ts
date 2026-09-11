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
        status: true,
        selectedAt: true,
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
