import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

import crypto from "node:crypto";
import QRCode from "qrcode";

type ConfirmationPageProps = {
  searchParams: Promise<{
    registration?: string;
  }>;
};

function formatCurrency(
  amount: bigint,
  currency: string,
) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(Number(amount) / 100);
}

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

  return `ASC-${cityCode}${yearCode}-P`;
}

export default async function ConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  const params = await searchParams;
  const registrationId = params.registration;

  if (!registrationId) {
    notFound();
  }

  let registration =
    await prisma.registration.findUnique({
      where: {
        id: registrationId,
      },
      include: {
        event: true,

        payments: {
          where: {
            status: "PAID",
          },
          orderBy: {
            paidAt: "desc",
          },
          take: 1,
        },
      },
    });

  if (!registration) {
    notFound();
  }

  const payment = registration.payments[0];

  // Confirmation is only available after payment.
  if (!payment) {
    redirect(
      `/register/payment?registration=${registration.id}`,
    );
  }

  /*
   * Legacy/development fallback.
   *
   * New successful payments should generate the registration
   * number inside processMockPayment().
   *
   * This handles registrations that were paid before we added
   * registration-number generation.
   */
  if (!registration.registrationNumber) {
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

    const registrationNumber =
      `${prefix}-${String(
        completedCount + 1,
      ).padStart(4, "0")}`;

    registration =
      await prisma.registration.update({
        where: {
          id: registration.id,
        },
        data: {
          registrationNumber,
          currentStep: "CONFIRMATION",
        },
        include: {
          event: true,

          payments: {
            where: {
              status: "PAID",
            },
            orderBy: {
              paidAt: "desc",
            },
            take: 1,
          },
        },
      });
  }

  if (!registration.checkInToken) {
  const checkInToken =
    crypto.randomBytes(32).toString("hex");

  registration =
    await prisma.registration.update({
      where: {
        id: registration.id,
      },
      data: {
        checkInToken,
      },
      include: {
        event: true,
        payments: {
          where: {
            status: "PAID",
          },
          orderBy: {
            paidAt: "desc",
          },
          take: 1,
        },
      },
    });
}

  const confirmedPayment =
    registration.payments[0];

  if (!registration.checkInToken) {
  throw new Error(
    "Check-in token could not be generated.",
  );
}

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL;

if (!appUrl) {
  throw new Error(
    "NEXT_PUBLIC_APP_URL is not configured.",
  );
}

const checkInUrl =
  `${appUrl}/checkin/${registration.checkInToken}`;

const qrCodeDataUrl =
  await QRCode.toDataURL(checkInUrl, {
    width: 320,
    margin: 2,
    errorCorrectionLevel: "H",
  });

  if (!confirmedPayment) {
    redirect(
      `/register/payment?registration=${registration.id}`,
    );
  }

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-4"
          >
            <svg
              viewBox="0 0 54 54"
              className="h-10 w-10"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M27 3 49 46 27 35 5 46 27 3Z"
                fill="#1685ff"
              />

              <path
                d="M27 15 38 37 27 31 16 37 27 15Z"
                fill="#020812"
              />
            </svg>

            <div>
              <span className="block text-lg font-semibold tracking-[0.36em]">
                ASCEND
              </span>

              <span className="block text-[10px] uppercase tracking-[0.28em] text-white/45">
                Football Showcase
              </span>
            </div>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
        <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#c7ff2f]">
          Step 10 of 10
        </div>

        <div className="mt-8 rounded-3xl border border-[#c7ff2f]/25 bg-[#c7ff2f]/[0.045] p-8 sm:p-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#c7ff2f] text-3xl font-black text-black">
            ✓
          </div>

          <h1 className="mt-7 text-4xl font-black sm:text-5xl">
            Registration Confirmed
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-white/55">
            Your place at the ASCEND Football Showcase
            has been secured.
          </p>

          <div className="mt-8 border-t border-white/10 pt-8">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
              Registration Number
            </div>

            <div className="mt-2 text-3xl font-black tracking-wide text-[#c7ff2f]">
              {registration.registrationNumber}
            </div>

            <p className="mt-3 text-sm text-white/40">
              Keep this number safe. It will be used
              for check-in, event administration and
              Showcase communications.
            </p>

       <div className="mt-8 flex flex-col gap-6 rounded-2xl border border-white/10 bg-black/20 p-6 sm:flex-row sm:items-center">
  <div className="shrink-0 rounded-2xl bg-white p-3">
    <img
      src={qrCodeDataUrl}
      alt={`Check-in QR code for ${registration.firstName} ${registration.lastName}`}
      className="h-44 w-44"
    />
  </div>

  <div>
    <div className="text-xs font-black uppercase tracking-[0.14em] text-[#c7ff2f]">
      Event Check-in QR
    </div>

    <div className="mt-2 text-lg font-black">
      Present this code on arrival
    </div>

    <p className="mt-2 max-w-md text-sm leading-6 text-white/50">
      ASCEND staff will scan this QR code during event registration
      to retrieve your confirmed registration and complete check-in.
    </p>

    <div className="mt-4 text-xs text-white/30">
      Registration: {registration.registrationNumber}
    </div>
  </div>
</div>

          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* PLAYER */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
              Player
            </div>

            <div className="mt-3 text-2xl font-black">
              {registration.firstName}{" "}
              {registration.lastName}
            </div>

            <div className="mt-1 text-white/45">
              {registration.primaryPosition}
            </div>

            <div className="mt-6 space-y-4 border-t border-white/10 pt-6 text-sm">
              <SummaryRow
                label="Event"
                value={registration.event.edition}
              />

              <SummaryRow
                label="Venue"
                value={registration.event.venue}
              />

              <SummaryRow
                label="City"
                value={`${registration.event.city}, ${registration.event.country}`}
              />

              <SummaryRow
                label="Registration"
                value={
                  registration.registrationNumber ??
                  "Pending"
                }
              />
            </div>
          </section>

          {/* PAYMENT */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
              Payment
            </div>

            <div className="mt-3 text-2xl font-black">
              Payment Confirmed
            </div>

            <div className="mt-1 text-white/45">
              Your registration fee has been recorded.
            </div>

            <div className="mt-6 space-y-4 border-t border-white/10 pt-6 text-sm">
              <SummaryRow
                label="Status"
                value="PAID"
              />

              <SummaryRow
                label="Amount"
                value={formatCurrency(
                  confirmedPayment.amount,
                  confirmedPayment.currency,
                )}
              />

              <SummaryRow
                label="Currency"
                value={confirmedPayment.currency}
              />

              <SummaryRow
                label="Provider"
                value={
                  confirmedPayment.provider === "MOCK"
                    ? "Development Payment"
                    : confirmedPayment.provider
                }
              />

              <SummaryRow
                label="Reference"
                value={
                  confirmedPayment.providerReference ??
                  confirmedPayment.id
                }
              />
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-2xl border border-[#c7ff2f]/20 bg-[#c7ff2f]/[0.05] p-6 sm:p-8">
          <div className="flex items-start gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#c7ff2f] text-black">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="M4 6h16v12H4z" />
                <path d="m4 7 8 6 8-6" />
              </svg>
            </div>

            <div className="min-w-0">
              <h2 className="text-2xl font-black sm:text-3xl">
                Check your email
              </h2>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60 sm:text-base">
                Your{" "}
                <span className="font-bold text-[#c7ff2f]">
                  registration confirmation, ASCEND Football Showcase brochure
                </span>{" "}
                and{" "}
                <span className="font-bold text-[#c7ff2f]">
                  check-in instructions
                </span>{" "}
                have been sent to your registered email address.
              </p>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60 sm:text-base">
                Please keep your confirmation email and{" "}
                <span className="font-bold text-[#c7ff2f]">
                  {registration.registrationNumber}
                </span>{" "}
                registration number safe — you will need them when you arrive
                at the Showcase check-in.
              </p>
            </div>
          </div>
        </section>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/"
            className="rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90"
          >
            Return to Showcase
          </Link>
        </div>
      </section>
    </main>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <span className="text-white/40">
        {label}
      </span>

      <span className="max-w-[60%] text-right font-medium">
        {value}
      </span>
    </div>
  );
}

function NextStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-5">
      <div className="text-xs font-black tracking-[0.15em] text-[#c7ff2f]">
        {number}
      </div>

      <div className="mt-3 font-black">
        {title}
      </div>

      <p className="mt-2 text-sm leading-6 text-white/45">
        {text}
      </p>
    </div>
  );
}
