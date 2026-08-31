"use server";

import crypto from "crypto";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

import {
  getFxQuote,
} from "@/lib/payments/fx";

import {
  initialisePaystackTransaction,
} from "@/lib/payments/paystack";

export async function startPaystackPayment(
  formData: FormData
) {
  const applicationId = String(
    formData.get("applicationId") || ""
  ).trim();

  if (!applicationId) {
    throw new Error(
      "Application ID is required."
    );
  }

  const application =
    await prisma.showcaseApplication.findUnique({
      where: {
        id: applicationId,
      },

      select: {
        id: true,
        eventSlug: true,

        firstName: true,
        lastName: true,
        email: true,

        assessmentFeeRequired: true,
        assessmentFeeAmount: true,
        assessmentFeePaid: true,

        assessmentDisclaimerAccepted: true,
      },
    });

  if (!application) {
    throw new Error(
      "Showcase application not found."
    );
  }

  if (
    application.assessmentFeeRequired &&
    !application.assessmentDisclaimerAccepted
  ) {
    redirect(
      `/apply/${application.eventSlug}/${application.id}/assessment-fee`
    );
  }

  if (application.assessmentFeePaid) {
    redirect(
      `/apply/${application.eventSlug}/${application.id}/confirmation`
    );
  }

  if (!application.assessmentFeeAmount) {
    throw new Error(
      "Assessment fee is not configured."
    );
  }

  const quote = getFxQuote(
    application.assessmentFeeAmount,
    "NGN"
  );

  const amountMinor = quote.chargeAmount;

  const reference =
    `ASC-PAY-LAG27-${Date.now()}-${crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()}`;

  const payment =
    await prisma.showcasePayment.create({
      data: {
        applicationId: application.id,

        provider: "PAYSTACK",
        status: "INITIALISED",

        reference,

        amountMinor,
        currency: quote.chargeCurrency,
      },
    });

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is not configured."
    );
  }

  let authorizationUrl: string;

  try {
    const paystack =
      await initialisePaystackTransaction({
        email: application.email,

        amountMinor,

        currency: quote.chargeCurrency,

        reference,

        callbackUrl:
          `${appUrl}/api/payments/paystack/callback`,

        metadata: {
          showcaseApplicationId:
            application.id,

          showcasePaymentId:
            payment.id,

          eventSlug:
            application.eventSlug,

          playerName:
            `${application.firstName} ${application.lastName}`,
        },
      });

    authorizationUrl =
      paystack.authorization_url;

    await prisma.showcasePayment.update({
      where: {
        id: payment.id,
      },

      data: {
        status: "PENDING",
      },
    });
  } catch (error) {
    await prisma.showcasePayment.update({
      where: {
        id: payment.id,
      },

      data: {
        status: "FAILED",
      },
    });

    console.error(
      "Paystack initialization failed:",
      error
    );

    redirect(
      `/apply/${application.eventSlug}/${application.id}/payment?payment=initialisation-failed&currency=${encodeURIComponent(
        quote.chargeCurrency
      )}`
    );
  }

  redirect(authorizationUrl);
}
