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
        "/?payment=missing-reference",
        request.nextUrl.origin
      )
    );
  }

  let stage = "START";

  try {
    /*
     * --------------------------------------------------------
     * FIND ASCEND PAYMENT
     * --------------------------------------------------------
     */

    stage = "FIND_PAYMENT";

    console.log(
      "PAYSTACK CALLBACK:",
      {
        stage,
        reference,
      }
    );

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
      console.error(
        "PAYSTACK CALLBACK PAYMENT NOT FOUND:",
        reference
      );

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
     * --------------------------------------------------------
     * ALREADY FINALISED
     * --------------------------------------------------------
     */

    if (
      payment.status === "SUCCESS" &&
      payment.application
        .assessmentFeePaid
    ) {
      console.log(
        "PAYSTACK CALLBACK ALREADY FINALISED:",
        reference
      );

      return NextResponse.redirect(
        new URL(
          confirmationPage,
          request.nextUrl.origin
        )
      );
    }

    /*
     * --------------------------------------------------------
     * VERIFY WITH PAYSTACK
     * --------------------------------------------------------
     */

    stage = "VERIFY_PAYSTACK";

    console.log(
      "PAYSTACK CALLBACK:",
      {
        stage,
        reference,
      }
    );

    const verified =
      await verifyPaystackTransaction(
        reference
      );

    /*
     * --------------------------------------------------------
     * VERIFY REFERENCE
     * --------------------------------------------------------
     */

    stage = "VERIFY_REFERENCE";

    if (
      verified.reference !==
      payment.reference
    ) {
      throw new Error(
        `Paystack reference mismatch. Expected ${payment.reference}, received ${verified.reference}.`
      );
    }

    /*
     * --------------------------------------------------------
     * VERIFY STATUS
     * --------------------------------------------------------
     */

    stage = "VERIFY_STATUS";

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

      console.warn(
        "PAYSTACK CALLBACK PAYMENT NOT SUCCESSFUL:",
        {
          reference,
          providerStatus:
            verified.status,
        }
      );

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
     * Both values are minor units.
     *
     * For NGN:
     * 5,000,000 kobo = ₦50,000
     */

    stage = "VERIFY_AMOUNT";

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

    stage = "VERIFY_CURRENCY";

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
     * FINALISE VERIFIED PAYMENT
     * --------------------------------------------------------
     */

    stage = "FINALISE_PAYMENT";

    console.log(
      "PAYSTACK CALLBACK:",
      {
        stage,
        reference,
        amountMinor:
          verified.amount,
        currency:
          verified.currency,
        providerTransactionId:
          String(verified.id),
      }
    );

    await finaliseShowcasePayment({
      paymentId:
        payment.id,

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

    /*
     * --------------------------------------------------------
     * COMPLETE
     * --------------------------------------------------------
     */

    stage = "COMPLETE";

    console.log(
      "PAYSTACK CALLBACK SUCCESS:",
      {
        reference,
        applicationId:
          payment.application.id,
      }
    );

    return NextResponse.redirect(
      new URL(
        confirmationPage,
        request.nextUrl.origin
      )
    );
  } catch (error) {
    console.error(
      "PAYSTACK CALLBACK ERROR:",
      {
        stage,
        reference,
        error,
      }
    );

    /*
     * Important:
     *
     * Paystack may already have taken payment.
     * Never create or retry a charge from here.
     *
     * The same reference can safely be replayed
     * after the underlying issue is corrected.
     */

    return NextResponse.redirect(
      new URL(
        `/?payment=callback-error&reference=${encodeURIComponent(
          reference
        )}`,
        request.nextUrl.origin
      )
    );
  }
}
