"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireStaffAdmin } from "@/lib/staff/auth";
import { sendShowcaseApplicationConfirmation } from "@/lib/email/sendShowcaseApplicationConfirmation";

export async function resendShowcaseConfirmation(applicationId: string) {
  await requireStaffAdmin();

  const application = await prisma.showcaseApplication.findUnique({
    where: {
      id: applicationId,
    },

    select: {
      id: true,
      email: true,
      submittedAt: true,
      registrationNumber: true,
      checkInToken: true,
    },
  });

  if (!application) {
    throw new Error("Showcase application not found.");
  }

  if (!application.submittedAt) {
    throw new Error(
      "Cannot send confirmation before the application has been submitted.",
    );
  }

  if (!application.registrationNumber) {
    throw new Error("Cannot send confirmation without a registration number.");
  }

  if (!application.checkInToken) {
    throw new Error("Cannot send confirmation without a check-in token.");
  }

  const result = await sendShowcaseApplicationConfirmation({
    applicationId: application.id,
    force: true,
  });

  revalidatePath("/staff/selection");

  return {
    sent: true,
    recipientEmail: result.recipientEmail,
    messageId: result.messageId,
  };
}
