import Link from "next/link";
import { activeEvent } from "@/data/event";

export default function RegistrationChoicePage() {
  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link href="/" className="flex items-center gap-4">
            <svg
              viewBox="0 0 54 54"
              className="h-10 w-10"
              fill="none"
              aria-hidden="true"
            >
              <path d="M27 3 49 46 27 35 5 46 27 3Z" fill="#1685ff" />
              <path d="M27 15 38 37 27 31 16 37 27 15Z" fill="#020812" />
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
            href="/"
            className="text-sm font-medium text-white/60 transition hover:text-white"
          >
            Back to event
          </Link>
        </div>
      </header>

      <section className="border-b border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#c7ff2f]">
            {activeEvent.edition}
          </div>

          <h1 className="mt-3 text-3xl font-black uppercase sm:text-4xl">
            Register
          </h1>

          <p className="mt-3 max-w-2xl text-white/55">
            Choose how you  would like to register for the ASCEND Lagos 2027 Football Showcase.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <Link
            href="/apply/lagos-2027"
            className="group rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 transition hover:border-[#c7ff2f]/50 hover:bg-white/[0.05] sm:p-10"
          >
            <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
              Player Registration
            </div>

            <h2 className="mt-5 text-3xl font-black uppercase">
              Player
            </h2>

            <p className="mt-4 max-w-lg leading-7 text-white/55">
              Apply as a player for the ASCEND Lagos 2027 Football Showcase.
            </p>

            <div className="mt-10 inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.1em]">
              Player Registration
              <span className="text-[#c7ff2f] transition group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>

          <Link
            href="/professional-registration"
            className="group rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 transition hover:border-[#1685ff]/60 hover:bg-white/[0.05] sm:p-10"
          >
            <div className="text-xs font-black uppercase tracking-[0.22em] text-[#1685ff]">
              Professional REGISTRATION
            </div>

            <h2 className="mt-5 text-3xl font-black uppercase leading-tight">
              Clubs / Scouts / Agents
            </h2>

            <p className="mt-4 max-w-lg leading-7 text-white/55">
              Register to attend Lagos 2027 as a football professional.
            </p>

            <div className="mt-10 inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.1em]">
              Professional Registration
              <span className="text-[#1685ff] transition group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm leading-6 text-white/45">
          Professional registration is required for club representatives,
          scouts and football agents attending the showcase. Event access and
          accreditation are subject to ASCEND approval.
        </div>
      </section>
    </main>
  );
}
