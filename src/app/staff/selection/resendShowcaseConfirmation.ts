"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireStaffAdmin } from "@/lib/staff/auth";
import { sendShowcaseApplicationConfirmation } from "@/lib/email/sendShowcaseApplicationConfirmation";

export async function resendShowcaseConfirmation(
  applicationId: string,
) {
  await requireStaffAdmin();

  const application =
    await prisma.showcaseApplication.findUnique({
      where: {
        id: applicationId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        assessmentFeePaid: true,
        registrationNumber: true,
        checkInToken: true,
        confirmationEmailSentAt: true,
      },
    });

  if (!application) {
    throw new Error(
      "Showcase application not found.",
    );
  }

  if (!application.assessmentFeePaid) {
    throw new Error(
      "Cannot send confirmation before the assessment fee has been paid.",
    );
  }

  if (!application.registrationNumber) {
    throw new Error(
      "Cannot send confirmation without a registration number.",
    );
  }

  if (!application.checkInToken) {
    throw new Error(
      "Cannot send confirmation without a check-in token.",
    );
  }

  if (application.confirmationEmailSentAt) {
    return {
      sent: false,
      reason: "ALREADY_SENT" as const,
      sentAt:
        application.confirmationEmailSentAt,
      recipientEmail: application.email,
    };
  }

  const result =
    await sendShowcaseApplicationConfirmation({
      applicationId: application.id,
    });

  revalidatePath("/staff/selection");

  return {
    sent: true,
    reason: "SENT" as const,
    recipientEmail:
      result.recipientEmail,
    messageId:
      result.messageId,
  };
}
