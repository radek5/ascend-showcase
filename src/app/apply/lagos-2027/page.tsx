import Link from "next/link";

import RevelationX1Logo from "@/components/brand/RevelationX1Logo";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Lagos2027ApplicationPage() {
  const event = await prisma.event.findUnique({
    where: {
      slug: "lagos-2027",
    },

    select: {
      registrationOpen: true,
      selectionDecisionsReleasedAt: true,
    },
  });

  const registrationOpen = event?.registrationOpen === true;

  const squadComplete = Boolean(event?.selectionDecisionsReleasedAt);

  return (
    <main className="min-h-screen bg-[#030817] px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <RevelationX1Logo />

        <p className="mt-8 text-sm font-black uppercase tracking-[0.28em] text-emerald-300">
          Lagos 2027
        </p>

        <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-tight md:text-6xl">
          {squadComplete
            ? "The Lagos 2027 Squad Is Complete"
            : "Your Journey to Lagos 2027 Starts Here"}
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
          {squadComplete
            ? "The Lagos 2027 selection process has been completed and selection decisions have now been released to applicants."
            : "Show us your game. Share your football story and videos for the chance to earn one of 50 fully funded places at the REVELATIONX1 Lagos 2027 Football Showcase."}
        </p>

        {squadComplete ? (
          <section className="mt-10 rounded-[2rem] border border-emerald-400/25 bg-emerald-400/10 p-7">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
              Lagos 2027 Selection Complete
            </p>

            <p className="mt-3 text-xl font-black leading-8 text-white">
              Selection decisions for the 50 Lagos 2027 places have now been
              released.
            </p>

            <p className="mt-3 leading-7 text-slate-300">
              Applicants can sign in to their REVELATIONX1 account to view their
              official Lagos 2027 selection decision and application status.
            </p>

            <p className="mt-3 leading-7 text-slate-400">
              New applications are no longer being accepted for this edition of
              the Showcase.
            </p>
          </section>
        ) : (
          <section className="mt-10 rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-7">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
              Your Opportunity. No Application Fee.
            </p>

            <p className="mt-3 leading-7 text-emerald-100">
              There is no application fee or assessment fee for the REVELATIONX1
              Lagos 2027 Men&apos;s Football Showcase.
            </p>

            <p className="mt-3 font-bold leading-7 text-white">
              50 players will be selected on ability following the application
              and screening process.
            </p>

            <p className="mt-3 leading-7 text-slate-300">
              Applying is free, but submission does not guarantee selection or
              an invitation to the Showcase.
            </p>
          </section>
        )}

        {!squadComplete ? (
          <>
            <section className="mt-8 grid gap-5 md:grid-cols-3">
              <InfoCard
                number="01"
                title="Tell Us About You"
                text="Complete your player profile and tell us about your football journey."
              />

              <InfoCard
                number="02"
                title="Show Us Your Game"
                text="Upload your football videos and give our team a chance to see you play."
              />

              <InfoCard
                number="03"
                title="Earn Your Place"
                text="50 players will be selected to join us in Lagos for the fully funded Showcase."
              />
            </section>

            <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">
              <h2 className="text-2xl font-black">If selected</h2>

              <p className="mt-3 leading-7 text-slate-300">
                Players selected for the final programme will attend the camp on
                a fully funded basis.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  "Official kit",
                  "Full-board accommodation",
                  "Hydration",
                  "Medical provision",
                  "Insurance",
                  "Transportation from accommodation to pitch",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm font-semibold text-slate-300"
                  >
                    ✓ {item}
                  </div>
                ))}
              </div>

              <p className="mt-6 text-sm leading-6 text-slate-400">
                Selected players are responsible for their own travel to and
                from the designated camp reporting location.
              </p>
            </section>
          </>
        ) : null}

        <div className="mt-8">
          <div className="flex flex-wrap gap-4">
            {registrationOpen && !squadComplete ? (
              <Link
                href="/account/register"
                className="rounded-full bg-emerald-400 px-7 py-4 font-black text-slate-950 transition hover:bg-emerald-300"
              >
                Start Your Journey
              </Link>
            ) : null}

            <Link
              href="/account/login"
              className="rounded-full border border-white/15 px-7 py-4 font-bold text-white transition hover:bg-white/5"
            >
              {squadComplete
                ? "Sign In to View Your Decision"
                : "Sign In to Continue"}
            </Link>
          </div>

          {squadComplete ? (
            <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] p-4">
              <p className="text-sm font-bold text-emerald-200">
                Lagos 2027 selection decisions have been released.
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                Existing applicants can sign in securely to view their
                application and official selection outcome.
              </p>
            </div>
          ) : registrationOpen ? (
            <p className="mt-4 text-sm leading-6 text-slate-500">
              New applicants must create a secure account and verify their email
              address. Returning applicants can sign in to continue a saved
              application or view its status.
            </p>
          ) : (
            <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4">
              <p className="text-sm font-bold text-amber-200">
                Applications are currently closed.
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                Returning applicants who have already started an application can
                sign in to continue or view their application status.
              </p>
            </div>
          )}

          <div className="mt-6">
            <Link
              href="/"
              className="text-sm font-bold text-slate-400 transition hover:text-white"
            >
              ← Back to REVELATIONX1
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
      <p className="text-sm font-black text-emerald-300">{number}</p>

      <h2 className="mt-3 text-xl font-black">{title}</h2>

      <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
    </div>
  );
}
