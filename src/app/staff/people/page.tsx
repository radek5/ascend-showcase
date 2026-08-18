import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

export default async function PeoplePage() {
  await requireStaffUser();

  const [
    players,
    professionals,
    accredited,
    professionalCheckedIn,
  ] = await Promise.all([
    prisma.registration.count(),

    prisma.professionalRegistration.count(),

    prisma.professionalRegistration.count({
      where: {
        status: {
          in: ["ACCREDITED", "CHECKED_IN"],
        },
      },
    }),

    prisma.professionalRegistration.count({
      where: {
        status: "CHECKED_IN",
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link
            href="/staff/dashboard"
            className="text-sm font-bold text-white/60 transition hover:text-white"
          >
            ← Back Office
          </Link>

          <div className="text-xs font-black uppercase tracking-[0.18em] text-[#c7ff2f]">
            Lagos 2027
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-[#c7ff2f]">
          People & Accreditation
        </div>

        <h1 className="mt-3 text-4xl font-black">
          Players & Professionals
        </h1>

        <p className="mt-4 max-w-2xl text-white/50">
          Manage the people attending the ASCEND Football Showcase.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Link
            href="/staff/registrations"
            className="rounded-[2rem] border border-white/10 bg-white/[0.025] p-8 transition hover:border-[#c7ff2f]/30"
          >
            <div className="text-xs font-black uppercase tracking-[0.15em] text-white/35">
              Players
            </div>

            <div className="mt-4 text-5xl font-black">
              {players.toLocaleString("en-GB")}
            </div>

            <p className="mt-4 text-white/50">
              Registration, payment, representation, video,
              medical/consent and player check-in.
            </p>

            <div className="mt-8 font-black text-[#c7ff2f]">
              Manage Players →
            </div>
          </Link>

          <Link
            href="/staff/professionals"
            className="rounded-[2rem] border border-white/10 bg-white/[0.025] p-8 transition hover:border-[#1685ff]/40"
          >
            <div className="text-xs font-black uppercase tracking-[0.15em] text-white/35">
              Professionals
            </div>

            <div className="mt-4 text-5xl font-black">
              {professionals.toLocaleString("en-GB")}
            </div>

            <p className="mt-4 text-white/50">
              Club representatives, scouts, football agents,
              accreditation, travel and professional check-in.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-black/20 p-4">
                <div className="text-xs text-white/35">
                  Accredited
                </div>

                <div className="mt-1 text-xl font-black">
                  {accredited}
                </div>
              </div>

              <div className="rounded-xl bg-black/20 p-4">
                <div className="text-xs text-white/35">
                  Checked In
                </div>

                <div className="mt-1 text-xl font-black">
                  {professionalCheckedIn}
                </div>
              </div>
            </div>

            <div className="mt-8 font-black text-[#1685ff]">
              Manage Professionals →
            </div>
          </Link>
          </div>
        <div className="mt-8 flex flex-wrap gap-3">
  <Link
    href="/staff/archive"
    className="rounded-full border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-[0.08em] text-white/50 transition hover:border-[#c7ff2f]/30 hover:text-[#c7ff2f]"
  >
    Archive
  </Link>

  <Link
    href="/staff/mailing-list"
    className="rounded-full border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-[0.08em] text-white/50 transition hover:border-[#1685ff]/30 hover:text-[#1685ff]"
  >
    Contact Network
  </Link>
        </div>
      </section>
    </main>
  );
}
