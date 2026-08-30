import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";

import {
  verifyPaystackTransaction,
} from "@/lib/payments/paystack";

import {
  finaliseShowcasePayment,
} from "@/lib/payments/finaliseShowcasePayment";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: NextRequest
) {
  const reference =
    request.nextUrl.searchParams.get(
      "reference"
    ) ||
    request.nextUrl.searchParams.get(
      "trxref"
    );

  if (!reference) {
    return NextResponse.redirect(
      new URL(
        "/",
        request.nextUrl.origin
      )
    );
  }

  const payment =
    await prisma.showcasePayment.findUnique({
      where: {
        reference,
      },

      select: {
        id: true,
        reference: true,
        amountMinor: true,
        currency: true,
        status: true,

        application: {
          select: {
            id: true,
            eventSlug: true,
            assessmentFeePaid: true,
          },
        },
      },
    });

  if (!payment) {
    return NextResponse.redirect(
      new URL(
        "/?payment=unknown",
        request.nextUrl.origin
      )
    );
  }

  const paymentPage =
    `/apply/${payment.application.eventSlug}/${payment.application.id}/payment`;

  const confirmationPage =
    `/apply/${payment.application.eventSlug}/${payment.application.id}/confirmation`;

  /*
   * If already successfully processed,
   * do not process it again.
   */

  if (
    payment.status === "SUCCESS" &&
    payment.application
      .assessmentFeePaid
  ) {
    return NextResponse.redirect(
      new URL(
        confirmationPage,
        request.nextUrl.origin
      )
    );
  }

  try {
    const verified =
      await verifyPaystackTransaction(
        reference
      );

    /*
     * --------------------------------------------------------
     * VERIFY REFERENCE
     * --------------------------------------------------------
     */

    if (
      verified.reference !==
      payment.reference
    ) {
      throw new Error(
        "Paystack payment reference mismatch."
      );
    }

    /*
     * --------------------------------------------------------
     * VERIFY PAYMENT STATUS
     * --------------------------------------------------------
     */

    if (
      verified.status !== "success"
    ) {
      await prisma.showcasePayment.update({
        where: {
          id: payment.id,
        },

        data: {
          status: "FAILED",
          providerStatus:
            verified.status,

          providerTransactionId:
            String(verified.id),

          gatewayResponse:
            verified.gateway_response ||
            null,

          verifiedAt: new Date(),
        },
      });

      return NextResponse.redirect(
        new URL(
          `${paymentPage}?payment=failed&currency=${encodeURIComponent(
            payment.currency
          )}`,
          request.nextUrl.origin
        )
      );
    }

    /*
     * --------------------------------------------------------
     * VERIFY EXACT AMOUNT
     * --------------------------------------------------------
     *
     * Paystack returns amount in the smallest
     * currency unit.
     */

    if (
      verified.amount !==
      payment.amountMinor
    ) {
      throw new Error(
        `Paystack amount mismatch. Expected ${payment.amountMinor}, received ${verified.amount}.`
      );
    }

    /*
     * --------------------------------------------------------
     * VERIFY CURRENCY
     * --------------------------------------------------------
     */

    if (
      verified.currency.toUpperCase() !==
      payment.currency.toUpperCase()
    ) {
      throw new Error(
        `Paystack currency mismatch. Expected ${payment.currency}, received ${verified.currency}.`
      );
    }

    /*
     * --------------------------------------------------------
     * VERIFIED PAYMENT
     * --------------------------------------------------------
     */

    await finaliseShowcasePayment({
      paymentId: payment.id,

      providerTransactionId:
        String(verified.id),

      providerStatus:
        verified.status,

      gatewayResponse:
        verified.gateway_response ||
        null,

      paidAt:
        verified.paid_at
          ? new Date(
              verified.paid_at
            )
          : new Date(),
    });

    return NextResponse.redirect(
      new URL(
        confirmationPage,
        request.nextUrl.origin
      )
    );
  } catch (error) {
    console.error(
      "Paystack callback verification failed:",
      error
    );

    /*
     * Do NOT mark the application as paid
     * if verification throws or any amount /
     * currency / reference check fails.
     */

    return NextResponse.redirect(
      new URL(
        `${paymentPage}?payment=verification-failed&currency=${encodeURIComponent(
          payment.currency
        )}`,
        request.nextUrl.origin
      )
    );
  }
}
