import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import RevelationX1Logo from "@/components/brand/RevelationX1Logo";
import {
  checkApplicantApplicationAccess,
  getApplicantApplicationAccessError,
} from "@/lib/applicants/applicationOwnership";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ConfirmationPage({ params }: PageProps) {
  const { id } = await params;

  const access = await checkApplicantApplicationAccess(id);

  if (!access.authorised) {
    const accessError = getApplicantApplicationAccessError(access);

    if (accessError.status === 401) {
      redirect("/apply/lagos-2027/account/login");
    }

    notFound();
  }

  const applicationId = access.applicationId;

  const application = await prisma.showcaseApplication.findUnique({
    where: {
      id: applicationId,
    },

    select: {
      id: true,
      eventSlug: true,

      firstName: true,
      lastName: true,

      status: true,
      submittedAt: true,

      selectionDecisionReleasedAt: true,
      selectionResponse: true,

      registrationNumber: true,
    },
  });

  if (!application) {
    notFound();
  }

  /*
   * ----------------------------------------------------------
   * SUBMISSION GUARD
   * ----------------------------------------------------------
   *
   * The confirmation page is only available after the
   * application has been formally submitted.
   *
   * Submission is independent of payment.
   */

  if (!application.submittedAt) {
    redirect(`/apply/${application.eventSlug}/${application.id}/review`);
  }

  const decisionReleased = Boolean(application.selectionDecisionReleasedAt);

  const releasedOutcome =
    decisionReleased &&
    ["SELECTED", "RESERVE", "NOT_SELECTED"].includes(application.status)
      ? application.status
      : null;

  const outcomePresentation =
    releasedOutcome === "SELECTED"
      ? {
          eyebrow: "Lagos 2027 Selection Decision",
          title: "You Have Been Selected",
          status: "Selected for Lagos 2027",
          tone: "selected" as const,
          message:
            "Congratulations. Following the REVELATIONX1 eligibility and football assessment process, you have been selected for the Lagos 2027 Men's Football Showcase.",
          next: "Your place has now been offered to you. REVELATIONX1 will provide the next steps for confirming your participation.",
        }
      : releasedOutcome === "RESERVE"
        ? {
            eyebrow: "Lagos 2027 Selection Decision",
            title: "You Are on the Reserve List",
            status: "Reserve List",
            tone: "reserve" as const,
            message:
              "Your application has completed the REVELATIONX1 assessment process and you have been placed on the Lagos 2027 reserve list.",
            next: "If a suitable place becomes available, REVELATIONX1 may contact you with an offer to join the Showcase.",
          }
        : releasedOutcome === "NOT_SELECTED"
          ? {
              eyebrow: "Lagos 2027 Selection Decision",
              title: "Selection Decision",
              status: "Not Selected on This Occasion",
              tone: "not-selected" as const,
              message:
                "Your Lagos 2027 application has completed the REVELATIONX1 eligibility and football assessment process. You have not been selected for the final Showcase on this occasion.",
              next: "Lagos 2027 was a competitive selection process with only 100 available places. Thank you for the time and effort you invested in your application.",
            }
          : null;

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <RevelationX1Logo />

          <Link
            href="/"
            className="text-sm font-medium text-white/60 transition hover:text-white"
          >
            Back to Event
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
        <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#c7ff2f]">
          {outcomePresentation ? outcomePresentation.eyebrow : "Step 8 of 8"}
        </div>

        <div className="mt-6 rounded-[2rem] border border-[#c7ff2f]/25 bg-[#c7ff2f]/[0.04] p-8 sm:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#c7ff2f] text-2xl font-black text-black">
            ✓
          </div>

          <h1 className="mt-6 text-4xl font-black sm:text-5xl">
            {outcomePresentation
              ? outcomePresentation.title
              : "Application Submitted"}
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-white/60">
            {outcomePresentation
              ? outcomePresentation.message
              : `Thank you, ${application.firstName}. Your application for the Lagos 2027 Men's Football Showcase and your submitted football evidence have been received.`}
          </p>

          {outcomePresentation ? (
            <div
              className={[
                "mt-6 rounded-xl border p-5",
                outcomePresentation.tone === "selected"
                  ? "border-[#c7ff2f]/30 bg-[#c7ff2f]/[0.06]"
                  : outcomePresentation.tone === "reserve"
                    ? "border-amber-400/25 bg-amber-400/[0.05]"
                    : "border-white/10 bg-white/[0.025]",
              ].join(" ")}
            >
              <div
                className={[
                  "text-xs font-black uppercase tracking-[0.12em]",
                  outcomePresentation.tone === "selected"
                    ? "text-[#c7ff2f]"
                    : outcomePresentation.tone === "reserve"
                      ? "text-amber-300"
                      : "text-white/60",
                ].join(" ")}
              >
                {outcomePresentation.status}
              </div>

              <p className="mt-2 text-sm leading-6 text-white/60">
                {outcomePresentation.next}
              </p>
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-5">
              <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
                Application Received
              </div>

              <p className="mt-2 text-sm leading-6 text-white/60">
                Your application will now enter the eligibility and football
                assessment process. Submission does not mean that you have been
                selected for the Showcase.
              </p>
            </div>
          )}

          {application.registrationNumber && (
            <div className="mt-8 rounded-2xl border border-[#c7ff2f]/25 bg-black/30 p-6">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-white/40">
                Your Permanent Registration Code
              </div>

              <div className="mt-3 break-words text-2xl font-black tracking-[0.08em] text-[#c7ff2f] sm:text-3xl">
                {application.registrationNumber}
              </div>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
                Keep this registration code safe. It remains your permanent
                Lagos 2027 Men&apos;s Football Showcase registration identity
                throughout the application, assessment and selection process.
              </p>
            </div>
          )}

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <SummaryItem
              label="Player"
              value={`${application.firstName} ${application.lastName}`}
            />

            <SummaryItem
              label="Application Status"
              value={
                outcomePresentation
                  ? outcomePresentation.status
                  : "Submitted — Under Assessment"
              }
            />
          </div>
        </div>

        {outcomePresentation ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="text-lg font-black">
              {releasedOutcome === "SELECTED"
                ? "What happens next?"
                : releasedOutcome === "RESERVE"
                  ? "What the reserve list means"
                  : "Thank you for applying"}
            </div>

            <div className="mt-5 space-y-5 text-sm leading-7 text-white/55">
              {releasedOutcome === "SELECTED" ? (
                <>
                  <p>
                    You have earned one of the 100 available places for the
                    Lagos 2027 Men&apos;s Football Showcase.
                  </p>

                  <p>
                    Your selection is now an offer of a place. You will need to
                    confirm whether you accept your place before your
                    participation is finalised.
                  </p>

                  <p>
                    REVELATIONX1 will provide your participation instructions
                    and event credential after the required confirmation stage.
                  </p>

                  <p className="font-bold text-white">
                    Do not make irreversible travel arrangements until your
                    participation has been confirmed by REVELATIONX1.
                  </p>
                </>
              ) : releasedOutcome === "RESERVE" ? (
                <>
                  <p>
                    You remain under consideration for Lagos 2027 if a suitable
                    place becomes available.
                  </p>

                  <p>
                    Reserve places are managed according to the needs of the
                    final player group. Your numeric position on the reserve
                    list is not published.
                  </p>

                  <p>
                    If REVELATIONX1 is able to offer you a place, you will be
                    contacted directly with the next steps.
                  </p>

                  <p className="font-bold text-white">
                    Being placed on the reserve list is not a confirmed
                    invitation to attend the Showcase.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Thank you for completing the Lagos 2027 application and
                    assessment process.
                  </p>

                  <p>
                    Selection was highly competitive, with only 100 places
                    available for the final Men&apos;s Football Showcase.
                  </p>

                  <p>
                    Not being selected for Lagos 2027 does not prevent you from
                    being considered for future REVELATIONX1 programmes and
                    opportunities.
                  </p>

                  <p className="font-bold text-white">
                    We appreciate the time and football evidence you committed
                    to this application.
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="text-lg font-black">What happens next?</div>

            <div className="mt-5 space-y-5 text-sm leading-7 text-white/55">
              <p>
                Your application will now enter REVELATIONX1&apos;s identity,
                age and event eligibility verification process. Lagos 2027 is
                the Men&apos;s Football Showcase for eligible male players aged
                18–20 on the first day of the programme.
              </p>

              <p>
                REVELATIONX1 will review the identity documents and information
                submitted with your application before your football evidence is
                released for assessment.
              </p>

              <p>
                Once your application has passed the required eligibility
                checks, your submitted football videos may be reviewed by
                authorised REVELATIONX1 selectors.
              </p>

              <p>
                If further football evidence or information is required,
                REVELATIONX1 may contact you before a final decision is made.
              </p>

              <p className="font-bold text-white">
                The best 100 eligible players will be selected for the final
                Lagos 2027 Men&apos;s Football Showcase.
              </p>
            </div>
          </div>
        )}

        {!outcomePresentation ? (
          <div className="mt-8 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-6">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-amber-300">
              Important
            </div>

            <p className="mt-3 text-sm leading-7 text-white/60">
              Submission of an application does not guarantee selection or an
              invitation to the Lagos 2027 Men&apos;s Football Showcase. Places
              cannot be purchased and selection is based on eligibility and
              football assessment.
            </p>
          </div>
        ) : null}

        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90"
          >
            Return to REVELATIONX1
          </Link>
        </div>
      </section>
    </main>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="text-xs font-black uppercase tracking-[0.08em] text-white/35">
        {label}
      </div>

      <div className="mt-2 break-words text-sm font-bold text-white/75">
        {value}
      </div>
    </div>
  );
}
