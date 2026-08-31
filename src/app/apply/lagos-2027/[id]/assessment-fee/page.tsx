import Link from "next/link";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/payments/formatCurrency";
import { prisma } from "@/lib/prisma";

import {
  acceptAssessmentFeeTerms,
} from "./actions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AssessmentFeePage({
  params,
}: PageProps) {
  const { id } = await params;

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

        assessmentDisclaimerAccepted:
          true,
      },
    });

  if (!application) {
    notFound();
  }

   const formattedAmount =
     application.assessmentFeeAmount !== null
       ? formatCurrency(
           application.assessmentFeeAmount,
           application.assessmentFeeCurrency
         )
    : null;

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
            href={`/apply/${application.eventSlug}/${application.id}/review`}
            className="text-sm font-medium text-white/60 transition hover:text-white"
          >
            Back
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-14 lg:px-8">
        <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#c7ff2f]">
          Step 8 of 10
        </div>

        <h1 className="mt-3 text-4xl font-black sm:text-5xl">
          Application & Assessment Fee
        </h1>

        <p className="mt-4 max-w-2xl text-white/55">
          Subject to identity, age and eligibility
  verification, your application and submitted
  football evidence will be professionally
  assessed as part of the ASCEND Lagos 2027
  player-selection process.
        </p>

        <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.025] p-7 sm:p-9">
          <div className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
            Assessment Fee
          </div>

          <div className="mt-4 text-4xl font-black">
            {formattedAmount ||
              "Fee to be confirmed"}
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/50">
            The fee covers the administration,
            processing and professional
            assessment of your application and
            submitted football video evidence.
          </p>
        </div>

        <div className="mt-7 rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] p-6">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">
            Important — Please Read Carefully
          </div>

          <p className="mt-4 text-base font-bold leading-7 text-white">
            Payment of the Application &
            Assessment Fee does not guarantee
            selection or an invitation to the
            ASCEND Lagos 2027 camp.
          </p>

          <p className="mt-4 text-sm leading-7 text-white/60">
            Applications will be assessed on
            football ability and the quality of
            the evidence submitted. Players who
            progress may also be asked to provide
            further video evidence.
          </p>

          <p className="mt-4 text-sm leading-7 text-white/60">
            <p className="mt-4 text-sm leading-7 text-white/60">
  Following the assessment and selection
  process, the best 100 eligible players
  will be selected for the Lagos 2027 camp.
</p>
          </p>
        </div>

        <div className="mt-7 rounded-2xl border border-[#c7ff2f]/20 bg-[#c7ff2f]/[0.04] p-6">
          <div className="text-lg font-black">
            If selected
          </div>

          <p className="mt-3 text-sm leading-7 text-white/60">
            Players selected for the final camp
            will receive the ASCEND funded camp
            package, including kit, hydration,
            medical support, insurance, full
            board and local transport between
            accommodation and the football
            venue.
          </p>

          <p className="mt-3 text-sm leading-7 text-white/45">
            Selected players remain responsible
            for their own travel to and from the
            camp location unless ASCEND confirms
            otherwise.
          </p>
        </div>

        <form
          action={acceptAssessmentFeeTerms}
          className="mt-8"
        >
          <input
            type="hidden"
            name="applicationId"
            value={application.id}
          />

          <label className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <input
              name="assessmentDisclaimerAccepted"
              type="checkbox"
              required
              defaultChecked={
                application.assessmentDisclaimerAccepted
              }
              className="mt-1"
            />

            <div>
              <div className="font-bold">
                Assessment Fee Declaration
              </div>

              <p className="mt-2 text-sm leading-6 text-white/55">
                I understand that the
                Application & Assessment Fee is
                charged for the processing and
                assessment of my application
                and football evidence, and that
                payment does not guarantee
                selection or an invitation to
                the ASCEND Lagos 2027 camp.
              </p>
            </div>
          </label>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              href={`/apply/${application.eventSlug}/${application.id}/review`}
              className="text-sm font-bold text-white/45 transition hover:text-white"
            >
              ← Back to Review
            </Link>

            <button
              type="submit"
              className="rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90"
            >
              Continue to Payment
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
