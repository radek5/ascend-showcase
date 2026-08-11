"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  getFxQuote,
  isSupportedCurrency,
} from "@/lib/payments/fx";

import crypto from "node:crypto";
import { sendRegistrationPass } from "@/lib/email/sendRegistrationPass";

function buildRegistrationPrefix(
  city: string,
  edition: string,
) {
  const cityCode = city
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 3)
    .toUpperCase();

  const yearMatch = edition.match(/\d{4}/);
  const yearCode = yearMatch
    ? yearMatch[0].slice(-2)
    : "XX";

  return `ASC-${cityCode}${yearCode}`;
}

export async function processMockPayment(formData: FormData) {
  const registrationId = String(
    formData.get("registrationId") || "",
  ).trim();

  const currency = String(
    formData.get("currency") || "",
  ).trim();

  const result = String(
    formData.get("result") || "",
  ).trim();

  if (!registrationId) {
    throw new Error("Registration ID missing.");
  }

  if (!isSupportedCurrency(currency)) {
    throw new Error("Unsupported payment currency.");
  }

  if (result !== "success" && result !== "decline") {
    throw new Error("Invalid mock payment result.");
  }

  const registration = await prisma.registration.findUnique({
    where: {
      id: registrationId,
    },
    include: {
      event: true,
    },
  });

  if (!registration) {
    throw new Error("Registration not found.");
  }

  const baseAmount =
    registration.event.registrationFeeAmount;

  if (!baseAmount) {
    throw new Error(
      "Registration fee has not been configured for this event.",
    );
  }

  const quote = getFxQuote(
    baseAmount,
    currency,
  );

  const existingPaidPayment =
    await prisma.payment.findFirst({
      where: {
        registrationId,
        status: "PAID",
      },
    });

  if (existingPaidPayment) {

 let registrationNumber =
  registration.registrationNumber;

if (!registrationNumber) {
  const prefix = buildRegistrationPrefix(
    registration.event.city,
    registration.event.edition,
  );

  const completedCount =
    await prisma.registration.count({
      where: {
        eventId: registration.eventId,
        registrationNumber: {
          not: null,
        },
      },
    });

  registrationNumber = `${prefix}-${String(
    completedCount + 1,
  ).padStart(4, "0")}`;
}

await prisma.registration.update({
  where: {
    id: registrationId,
  },
  data: {
    registrationNumber,
    currentStep: "CONFIRMATION",
  },
});

    redirect(
      `/register/confirmation?registration=${registrationId}`,
    );
  }

  const reference =
    `MOCK-${Date.now()}-${registrationId.slice(-6)}`;

  if (result === "decline") {
    await prisma.payment.create({
      data: {
        registrationId,

        status: "FAILED",
        provider: "MOCK",

        providerReference: reference,
        providerTransaction:
          `TEST-DECLINED-${Date.now()}`,

        amount: quote.chargeAmount,
        currency: quote.chargeCurrency,

        baseAmount: quote.baseAmount,
        baseCurrency: quote.baseCurrency,

        fxRate: quote.rate,
        fxSource: quote.source,
        fxQuotedAt: quote.quotedAt,

        failureReason:
          "Simulated payment decline",
      },
    });

    redirect(
      `/register/payment?registration=${registrationId}&payment=declined&currency=${currency}`,
    );
  }

  await prisma.payment.create({
    data: {
      registrationId,

      status: "PAID",
      provider: "MOCK",

      providerReference: reference,
      providerTransaction:
        `TEST-SUCCESS-${Date.now()}`,

      amount: quote.chargeAmount,
      currency: quote.chargeCurrency,

      baseAmount: quote.baseAmount,
      baseCurrency: quote.baseCurrency,

      fxRate: quote.rate,
      fxSource: quote.source,
      fxQuotedAt: quote.quotedAt,

      paidAt: new Date(),
    },
  });

let registrationNumber =
  registration.registrationNumber;

if (!registrationNumber) {
  const prefix = buildRegistrationPrefix(
    registration.event.city,
    registration.event.edition,
  );

  const completedCount =
    await prisma.registration.count({
      where: {
        eventId: registration.eventId,
        registrationNumber: {
          not: null,
        },
      },
    });

  registrationNumber = `${prefix}-${String(
    completedCount + 1,
  ).padStart(4, "0")}`;
}

const checkInToken =
  registration.checkInToken ??
  crypto.randomBytes(32).toString("hex");

await prisma.registration.update({
  where: {
    id: registrationId,
  },
  data: {
    registrationNumber,
    checkInToken,
    currentStep: "CONFIRMATION",
  },
});

  try {
  await sendRegistrationPass({
    registrationId,
  });
} catch (error) {
  console.error(
    "Registration confirmed but confirmation email failed:",
    error,
  );
}

  redirect(
    `/register/confirmation?registration=${registrationId}`,
  );
}
