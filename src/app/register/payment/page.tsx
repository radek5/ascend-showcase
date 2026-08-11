import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  getFxQuote,
  getSupportedCurrencies,
  isSupportedCurrency,
} from "@/lib/payments/fx";
import { formatCurrency } from "@/lib/payments/formatCurrency";
import { processMockPayment } from "../actions/processMockPayment";

type PaymentPageProps = {
  searchParams: Promise<{
    registration?: string;
    payment?: string;
    currency?: string;
  }>;
};

export default async function PaymentPage({
  searchParams,
}: PaymentPageProps) {
  const params = await searchParams;

  const registrationId =
    params.registration;

  if (!registrationId) {
    notFound();
  }

  const registration =
    await prisma.registration.findUnique({
      where: {
        id: registrationId,
      },
      include: {
        event: true,
        payments: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

  if (!registration) {
    notFound();
  }

  const baseAmount =
    registration.event.registrationFeeAmount;

  if (!baseAmount) {
    throw new Error(
      "Registration fee has not been configured.",
    );
  }

  const requestedCurrency =
    params.currency &&
    isSupportedCurrency(params.currency)
      ? params.currency
      : registration.event
          .registrationFeeCurrency === "NGN"
        ? "NGN"
        : "NGN";

  const supportedCurrencies =
    getSupportedCurrencies();

  const quotes = supportedCurrencies.map(
    (currency) =>
      getFxQuote(
        baseAmount,
        currency,
      ),
  );

  const selectedQuote = getFxQuote(
    baseAmount,
    requestedCurrency,
  );

  const alreadyPaid =
    registration.payments.some(
      (payment) =>
        payment.status === "PAID",
    );

  const declined =
    params.payment === "declined";

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

          <Link
            href={`/register/review?registration=${registration.id}`}
            className="text-sm font-medium text-white/60 transition hover:text-white"
          >
            Back
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1fr_340px] lg:px-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#c7ff2f]">
            Step 9 of 10
          </div>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Payment
          </h1>

          <p className="mt-3 max-w-2xl text-white/55">
            Choose your preferred payment currency
            and complete your Showcase
            registration.
          </p>

          {declined && (
            <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-5">
              <div className="font-black text-red-300">
                Payment declined
              </div>

              <p className="mt-2 text-sm leading-6 text-white/50">
                This was a simulated decline.
                No real payment was attempted.
              </p>
            </div>
          )}

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
              Registration Fee
            </div>

            <div className="mt-3 text-3xl font-black">
              {formatCurrency(
                baseAmount,
                "NGN",
              )}
            </div>

            <div className="mt-1 text-sm text-white/40">
              Base event price
            </div>
          </div>

          <div className="mt-8">
            <div className="text-lg font-black">
              Choose payment currency
            </div>

            <p className="mt-2 text-sm text-white/45">
              Select the currency you would
              prefer to use for payment.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {quotes.map((quote) => {
                const selected =
                  quote.chargeCurrency ===
                  requestedCurrency;

                return (
                  <Link
                    key={quote.chargeCurrency}
                    href={`/register/payment?registration=${registration.id}&currency=${quote.chargeCurrency}`}
                    className={`rounded-2xl border p-5 transition ${
                      selected
                        ? "border-[#c7ff2f]/70 bg-[#c7ff2f]/[0.07]"
                        : "border-white/10 bg-white/[0.025] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-5">
                      <div>
                        <div className="text-sm font-black">
                          {quote.chargeCurrency}
                        </div>

                        <div className="mt-1 text-xs text-white/35">
                          Payment currency
                        </div>
                      </div>

                      <div className="text-xl font-black">
                        {formatCurrency(
                          quote.chargeAmount,
                          quote.chargeCurrency,
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
              Development Payment Simulator
            </div>

            <p className="mt-3 text-sm leading-6 text-white/55">
              No real money will be taken.
              Exchange rates and payment responses
              are simulated in this development
              environment.
            </p>

            <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex justify-between gap-6">
                <span className="text-sm text-white/40">
                  Selected currency
                </span>

                <span className="font-bold">
                  {
                    selectedQuote
                      .chargeCurrency
                  }
                </span>
              </div>

              <div className="mt-3 flex justify-between gap-6">
                <span className="text-sm text-white/40">
                  Amount
                </span>

                <span className="font-black">
                  {formatCurrency(
                    selectedQuote
                      .chargeAmount,
                    selectedQuote
                      .chargeCurrency,
                  )}
                </span>
              </div>

              <div className="mt-3 flex justify-between gap-6">
                <span className="text-sm text-white/40">
                  FX source
                </span>

                <span className="text-sm">
                  {selectedQuote.source}
                </span>
              </div>
            </div>

            {alreadyPaid ? (
              <div className="mt-6">
                <div className="rounded-xl border border-[#c7ff2f]/20 bg-[#c7ff2f]/[0.05] p-5">
                  <div className="font-black text-[#c7ff2f]">
                    Payment already recorded
                  </div>
                </div>

                <Link
                  href={`/register/confirmation?registration=${registration.id}`}
                  className="mt-6 inline-flex rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black"
                >
                  Continue
                </Link>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <form
                  action={
                    processMockPayment
                  }
                >
                  <input
                    type="hidden"
                    name="registrationId"
                    value={registration.id}
                  />

                  <input
                    type="hidden"
                    name="currency"
                    value={
                      selectedQuote
                        .chargeCurrency
                    }
                  />

                  <input
                    type="hidden"
                    name="result"
                    value="success"
                  />

                  <button
                    type="submit"
                    className="w-full rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90"
                  >
                    Simulate Successful Payment
                  </button>
                </form>

                <form
                  action={
                    processMockPayment
                  }
                >
                  <input
                    type="hidden"
                    name="registrationId"
                    value={registration.id}
                  />

                  <input
                    type="hidden"
                    name="currency"
                    value={
                      selectedQuote
                        .chargeCurrency
                    }
                  />

                  <input
                    type="hidden"
                    name="result"
                    value="decline"
                  />

                  <button
                    type="submit"
                    className="w-full rounded-full border border-white/15 px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:border-red-400/50"
                  >
                    Simulate Declined Payment
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        <aside>
          <div className="sticky top-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/40">
              Payment Summary
            </div>

            <div className="mt-5 text-xl font-black">
              {registration.firstName}{" "}
              {registration.lastName}
            </div>

            <div className="mt-1 text-[#c7ff2f]">
              {registration.event.edition}
            </div>

            <div className="mt-6 space-y-4 border-t border-white/10 pt-6 text-sm">
              <div className="flex justify-between gap-6">
                <span className="text-white/40">
                  Base price
                </span>

                <span>
                  {formatCurrency(
                    baseAmount,
                    "NGN",
                  )}
                </span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-white/40">
                  Paying in
                </span>

                <span>
                  {
                    selectedQuote
                      .chargeCurrency
                  }
                </span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-white/40">
                  Total
                </span>

                <span className="font-black">
                  {formatCurrency(
                    selectedQuote
                      .chargeAmount,
                    selectedQuote
                      .chargeCurrency,
                  )}
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-[#c7ff2f]/15 bg-[#c7ff2f]/[0.05] p-4 text-sm leading-6 text-white/60">
              This development checkout uses mock
              FX rates and simulated payment
              responses.
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
