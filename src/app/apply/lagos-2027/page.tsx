import Link from "next/link";

export default function Lagos2027ApplicationPage() {
  return (
    <main className="min-h-screen bg-[#030817] px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-black uppercase tracking-[0.28em] text-emerald-300">
          REVELATIONX1 · Lagos 2027
        </p>

        <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-tight md:text-6xl">
          Apply for Player Assessment
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
          Submit your football information and video for professional
          assessment.
        </p>

        <section className="mt-10 rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-7">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
            Free to Apply
          </p>

          <p className="mt-3 leading-7 text-emerald-100">
            There is no application fee or assessment fee for the REVELATIONX1
            Lagos 2027 Men&apos;s Football Showcase.
          </p>

          <p className="mt-3 font-bold leading-7 text-white">
            100 players will be selected on ability following the application
            and screening process.
          </p>

          <p className="mt-3 leading-7 text-slate-300">
            Applying is free, but submission does not guarantee selection or an
            invitation to the Showcase.
          </p>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <InfoCard
            number="01"
            title="Apply"
            text="Complete your football application and player information."
          />

          <InfoCard
            number="02"
            title="Submit Video"
            text="Provide the required football video for professional assessment."
          />

          <InfoCard
            number="03"
            title="Selection"
            text="The best 100 players will be selected for the camp."
          />
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">
          <h2 className="text-2xl font-black">If selected</h2>

          <p className="mt-3 leading-7 text-slate-300">
            Players selected for the final programme will attend the camp on a
            fully funded basis.
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
            Selected players are responsible for their own travel to and from
            the designated camp reporting location.
          </p>
        </section>

        <div className="mt-8">
          <div className="flex flex-wrap gap-4">
            <Link
              href="/account/register"
              className="rounded-full bg-emerald-400 px-7 py-4 font-black text-slate-950 transition hover:bg-emerald-300"
            >
              Create Account &amp; Apply
            </Link>

            <Link
              href="/account/login"
              className="rounded-full border border-white/15 px-7 py-4 font-bold text-white transition hover:bg-white/5"
            >
              Sign In to Continue
            </Link>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-500">
            New applicants must create a secure account and verify their email
            address. Returning applicants can sign in to continue a saved
            application or view its status.
          </p>

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
