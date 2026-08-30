import { prisma } from "@/lib/prisma";

import {
  allocateApplicationIdentity,
} from "@/lib/showcase/allocateApplicationIdentity";

import {
  sendShowcaseApplicationConfirmation,
} from "@/lib/email/sendShowcaseApplicationConfirmation";

export async function finaliseShowcasePayment({
  paymentId,
  providerTransactionId,
  providerStatus,
  gatewayResponse,
  paidAt,
}: {
  paymentId: string;
  providerTransactionId?: string | null;
  providerStatus?: string | null;
  gatewayResponse?: string | null;
  paidAt?: Date | null;
}) {
  const payment =
    await prisma.showcasePayment.findUnique({
      where: {
        id: paymentId,
      },

      select: {
        id: true,
        reference: true,
        status: true,

        application: {
          select: {
            id: true,
            assessmentFeePaid: true,
          },
        },
      },
    });

  if (!payment) {
    throw new Error(
      "Showcase payment not found."
    );
  }

  /*
   * ----------------------------------------------------------
   * RECORD VERIFIED PAYMENT
   * ----------------------------------------------------------
   *
   * The database operation is deliberately idempotent.
   * If the callback and webhook both arrive, we do not
   * record the application payment twice.
   */

  await prisma.$transaction(async (tx) => {
    await tx.showcasePayment.update({
      where: {
        id: payment.id,
      },

      data: {
        status: "SUCCESS",

        providerTransactionId:
          providerTransactionId || null,

        providerStatus:
          providerStatus || "success",

        gatewayResponse:
          gatewayResponse || null,

        verifiedAt: new Date(),

        paidAt:
          paidAt || new Date(),
      },
    });

    if (
      !payment.application
        .assessmentFeePaid
    ) {
      await tx.showcaseApplication.update({
        where: {
          id: payment.application.id,
        },

        data: {
          assessmentFeePaid: true,
          assessmentFeePaidAt:
            paidAt || new Date(),

          assessmentPaymentReference:
            payment.reference,

          status: "SUBMITTED",

          submittedAt: new Date(),
        },
      });
    }
  });

  /*
   * ----------------------------------------------------------
   * PERMANENT APPLICATION IDENTITY
   * ----------------------------------------------------------
   */

  await allocateApplicationIdentity({
    applicationId:
      payment.application.id,
  });

  /*
   * ----------------------------------------------------------
   * CONFIRMATION EMAIL
   * ----------------------------------------------------------
   *
   * Email failure must never reverse a verified payment.
   */

  try {
    await sendShowcaseApplicationConfirmation({
      applicationId:
        payment.application.id,
    });
  } catch (error) {
    console.error(
      "Verified showcase payment recorded but confirmation email failed:",
      error
    );
  }

  return {
    applicationId:
      payment.application.id,

    reference:
      payment.reference,
  };
}
