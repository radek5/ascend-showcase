import Link from "next/link";

export default function Lagos2027ApplicationPage() {
  return (
    <main className="min-h-screen bg-[#030817] px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-black uppercase tracking-[0.28em] text-emerald-300">
          ASCEND · Lagos 2027
        </p>

        <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-tight md:text-6xl">
          Apply for Player Assessment
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
          Submit your football information and video for
          professional assessment.
          2027.
        </p>

        <section className="mt-10 rounded-[2rem] border border-amber-400/20 bg-amber-400/10 p-7">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-300">
            Important
          </p>

          <p className="mt-3 leading-7 text-amber-100">
            The Application &amp; Assessment Fee covers the
            processing and professional assessment of your
            application and submitted video.
          </p>

          <p className="mt-3 font-bold leading-7 text-white">
            Payment of the Application &amp; Assessment Fee does
            not guarantee selection or an invitation to the
            Lagos 2027 Men&apos;s Football Showcase camp.
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
          <h2 className="text-2xl font-black">
            If selected
          </h2>

          <p className="mt-3 leading-7 text-slate-300">
            Players selected for the final programme will attend
            the camp on a fully funded basis.
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
            Selected players are responsible for their own travel
            to and from the designated camp reporting location.
          </p>
        </section>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/apply/lagos-2027/start"
            className="rounded-full bg-emerald-400 px-7 py-4 font-black text-slate-950 transition hover:bg-emerald-300"
          >
            Start Application
          </Link>

          <Link
            href="/"
            className="rounded-full border border-white/10 px-7 py-4 font-bold text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            Back to ASCEND
          </Link>
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
      <p className="text-sm font-black text-emerald-300">
        {number}
      </p>

      <h2 className="mt-3 text-xl font-black">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {text}
      </p>
    </div>
  );
}
