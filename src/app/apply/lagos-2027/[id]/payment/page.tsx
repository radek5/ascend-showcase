import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import {
  getFxQuote,
} from "@/lib/payments/fx";

import {
  formatCurrency,
} from "@/lib/payments/formatCurrency";

import {
  startPaystackPayment,
} from "./actions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    payment?: string;
    currency?: string;
  }>;
};

export default async function ShowcasePaymentPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = await searchParams;

  const application =
    await prisma.showcaseApplication.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
        eventSlug: true,

        firstName: true,
        lastName: true,

        assessmentFeeRequired: true,
        assessmentFeeAmount: true,
        assessmentFeeCurrency: true,

        assessmentFeePaid: true,
        assessmentFeePaidAt: true,

        assessmentDisclaimerAccepted:
          true,

        assessmentPaymentReference:
          true,
      },
    });

  if (!application) {
    notFound();
  }

  if (
    application.assessmentFeeRequired &&
    !application.assessmentDisclaimerAccepted
  ) {
    return (
      <main className="min-h-screen bg-[#090909] px-6 py-20 text-white">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-black">
            Assessment declaration required
          </h1>

          <p className="mt-4 text-white/55">
            Please accept the Application &
            Assessment Fee declaration before
            continuing to payment.
          </p>

          <Link
            href={`/apply/${application.eventSlug}/${application.id}/assessment-fee`}
            className="mt-8 inline-flex rounded-full bg-[#c7ff2f] px-7 py-4 text-sm font-black uppercase tracking-[0.08em] text-black"
          >
            Return to Assessment Fee
          </Link>
        </div>
      </main>
    );
  }

  const baseAmount =
    application.assessmentFeeAmount;

  if (!baseAmount) {
    return (
      <main className="min-h-screen bg-[#090909] px-6 py-20 text-white">
        <div className="mx-auto max-w-2xl rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-8">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">
            Payment unavailable
          </div>

          <h1 className="mt-3 text-3xl font-black">
            Assessment fee not configured
          </h1>

          <p className="mt-4 leading-7 text-white/55">
            The Application & Assessment Fee
            has not yet been configured for
            this application.
          </p>

          <Link
            href={`/apply/${application.eventSlug}/${application.id}/assessment-fee`}
            className="mt-7 inline-flex text-sm font-bold text-[#c7ff2f]"
          >
            ← Back to Assessment Fee
          </Link>
        </div>
      </main>
    );
  }

  const selectedQuote =
    getFxQuote(
      baseAmount,
      "NGN"
    );

  const initialisationFailed =
    query.payment ===
    "initialisation-failed";

  const paymentFailed =
    query.payment === "failed";

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
            href={`/apply/${application.eventSlug}/${application.id}/assessment-fee`}
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

          <h1 className="mt-3 text-4xl font-black">
            Secure Payment
          </h1>

          <p className="mt-3 max-w-2xl text-white/55">
            Complete payment of your
            Application & Assessment Fee
            securely through Paystack.
          </p>

          {(initialisationFailed ||
            paymentFailed) && (
            <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-5">
              <div className="font-black text-red-300">
                Payment was not completed
              </div>

              <p className="mt-2 text-sm leading-6 text-white/50">
                No successful payment has been
                recorded. Please try again.
              </p>
            </div>
          )}

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
              Application & Assessment Fee
            </div>

            <div className="mt-3 text-3xl font-black">
              {formatCurrency(
                baseAmount,
                "NGN"
              )}
            </div>

            <div className="mt-1 text-sm text-white/40">
              Base assessment price
            </div>
          </div>

          <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.025] p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#c7ff2f] font-black text-black">
                P
              </div>

              <div>
                <div className="text-xs font-black uppercase tracking-[0.15em] text-[#c7ff2f]">
                  Paystack Secure Checkout
                </div>

                <div className="mt-2 text-xl font-black">
                  Continue to secure payment
                </div>

                <p className="mt-3 max-w-xl text-sm leading-7 text-white/50">
                  You will be redirected to
                  Paystack to complete your
                  payment. ASCEND does not
                  receive or store your card
                  details.
                </p>
              </div>
            </div>

            <div className="mt-7 rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex justify-between gap-6">
                <span className="text-sm text-white/40">
                  Payment currency
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
                      .chargeCurrency
                  )}
                </span>
              </div>
            </div>

            {application.assessmentFeePaid ? (
              <div className="mt-6">
                <div className="rounded-xl border border-[#c7ff2f]/20 bg-[#c7ff2f]/[0.05] p-5">
                  <div className="font-black text-[#c7ff2f]">
                    Payment confirmed
                  </div>

                  {application.assessmentPaymentReference && (
                    <div className="mt-2 text-xs text-white/40">
                      Reference:{" "}
                      {
                        application.assessmentPaymentReference
                      }
                    </div>
                  )}
                </div>

                <Link
                  href={`/apply/${application.eventSlug}/${application.id}/confirmation`}
                  className="mt-6 inline-flex rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black"
                >
                  Continue to Confirmation
                </Link>
              </div>
            ) : (
              <form
                action={
                  startPaystackPayment
                }
                className="mt-7"
              >
                <input
                  type="hidden"
                  name="applicationId"
                  value={application.id}
                />

                <input
                  type="hidden"
                  name="currency"
                  value="NGN"
                />

                <button
                  type="submit"
                  className="w-full rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90"
                >
                  Continue to Secure Payment
                </button>
              </form>
            )}

            <p className="mt-4 text-center text-xs leading-5 text-white/30">
              Paystack Test Mode is currently
              being used. No live payment
              should be taken during development.
            </p>
          </div>
        </div>

        <aside>
          <div className="sticky top-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/40">
              Payment Summary
            </div>

            <div className="mt-5">
              <div className="text-sm text-white/40">
                Player
              </div>

              <div className="mt-1 font-black">
                {application.firstName}{" "}
                {application.lastName}
              </div>
            </div>

            <div className="mt-5 border-t border-white/10 pt-5">
              <div className="flex items-center justify-between gap-5">
                <span className="text-sm text-white/40">
                  Amount due
                </span>

                <span className="text-xl font-black">
                  {formatCurrency(
                    selectedQuote
                      .chargeAmount,
                    selectedQuote
                      .chargeCurrency
                  )}
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-[#c7ff2f]/15 bg-[#c7ff2f]/[0.04] p-4">
              <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
                Secure Payment
              </div>

              <p className="mt-2 text-xs leading-6 text-white/50">
                Payment is processed securely
                by Paystack. Card and banking
                details are handled by the
                payment provider.
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4">
              <p className="text-xs leading-6 text-white/50">
                Payment covers application
                processing and football
                assessment. Payment does not
                guarantee selection for the
                Lagos 2027 Men&apos;s Football Showcase camp.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
