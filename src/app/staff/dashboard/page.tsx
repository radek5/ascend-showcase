import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";
import { staffLogout } from "../actions/logout";

export default async function StaffDashboardPage() {
  const staffUser = await requireStaffUser();

  const [
    playerCount,
    professionalCount,
    playerCheckedInCount,
    professionalCheckedInCount,
    transferCount,
  ] = await Promise.all([
    prisma.registration.count(),

    prisma.professionalRegistration.count(),

    prisma.registration.count({
      where: {
        checkedInAt: {
          not: null,
        },
      },
    }),

    prisma.professionalRegistration.count({
      where: {
        checkedInAt: {
          not: null,
        },
      },
    }),

    prisma.professionalRegistration.count({
      where: {
        OR: [
          {
            arrivalTransfer: true,
          },
          {
            departureTransfer: true,
          },
        ],
      },
    }),
  ]);

  const totalPeople =
    playerCount + professionalCount;

  const totalCheckedIn =
    playerCheckedInCount +
    professionalCheckedInCount;

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10 bg-[#0b0b0b]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link
            href="/staff/dashboard"
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
              <span className="block text-lg font-semibold tracking-[0.32em]">
                ASCEND
              </span>

              <span className="block text-[10px] uppercase tracking-[0.22em] text-white/40">
                Back Office
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-5">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-bold">
                {staffUser.name}
              </div>

              <div className="text-xs uppercase tracking-[0.1em] text-white/35">
                {staffUser.role}
              </div>
            </div>

            <form action={staffLogout}>
              <button
                type="submit"
                className="rounded-full border border-white/10 px-5 py-2.5 text-xs font-black uppercase tracking-[0.08em] text-white/60 transition hover:border-white/20 hover:text-white"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
          Lagos 2027
        </div>

        <h1 className="mt-3 text-4xl font-black sm:text-5xl">
          Back Office
        </h1>

        <p className="mt-4 max-w-2xl text-white/50">
          Manage people, accreditation and event operations for the
          ASCEND Football Showcase.
        </p>

        {/* EVENT SNAPSHOT */}

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="People"
            value={totalPeople}
            description="Players + professionals"
          />

          <MetricCard
            label="Players"
            value={playerCount}
            description="Player registrations"
          />

          <MetricCard
            label="Professionals"
            value={professionalCount}
            description="Club reps, scouts & agents"
          />

          <MetricCard
            label="Checked In"
            value={totalCheckedIn}
            description="People currently checked in"
          />
        </div>

        {/* TWO WORKSPACES */}

        <div className="mt-12 grid gap-7 lg:grid-cols-2">
          <Link
            href="/staff/people"
            className="group rounded-[2rem] border border-white/10 bg-white/[0.025] p-8 transition hover:border-[#c7ff2f]/35 hover:bg-[#c7ff2f]/[0.025] sm:p-10"
          >
            <div className="text-xs font-black uppercase tracking-[0.2em] text-[#c7ff2f]">
              Workspace 01
            </div>

            <h2 className="mt-4 text-3xl font-black">
              Players & Professionals
            </h2>

            <p className="mt-4 max-w-xl leading-7 text-white/50">
              Manage everyone attending Lagos 2027 — player
              registrations, club representatives, scouts, football
              agents, accreditation and check-in.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <MiniStat
                label="Players"
                value={playerCount}
              />

              <MiniStat
                label="Professionals"
                value={professionalCount}
              />
            </div>

            <div className="mt-8 text-sm font-black uppercase tracking-[0.08em] text-[#c7ff2f]">
              Open People & Accreditation →
            </div>
          </Link>

          <Link
            href="/staff/operations"
            className="group rounded-[2rem] border border-white/10 bg-white/[0.025] p-8 transition hover:border-[#1685ff]/40 hover:bg-[#1685ff]/[0.025] sm:p-10"
          >
            <div className="text-xs font-black uppercase tracking-[0.2em] text-[#1685ff]">
              Workspace 02
            </div>

            <h2 className="mt-4 text-3xl font-black">
              Event Operations
            </h2>

            <p className="mt-4 max-w-xl leading-7 text-white/50">
              Run the event — payments, airport transfers,
              accommodation, check-in operations, staff, reporting and
              event logistics.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <MiniStat
                label="Airport Transfers"
                value={transferCount}
              />

              <MiniStat
                label="Checked In"
                value={totalCheckedIn}
              />
            </div>

            <div className="mt-8 text-sm font-black uppercase tracking-[0.08em] text-[#1685ff]">
              Open Event Operations →
            </div>
          </Link>
        </div>

        {/* QUICK ACCESS */}

        <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="text-xs font-black uppercase tracking-[0.15em] text-white/35">
            Quick Access
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <QuickLink
              href="/staff/registrations"
              label="Players"
            />

            <QuickLink
              href="/staff/professionals"
              label="Professionals"
            />
         
            <QuickLink
              href="/staff/mailing-list"
              label="Contact Network"
            />

            <QuickLink
              href="/staff/payments"
              label="Payments"
            />

            <QuickLink
              href="/staff/checkin"
              label="Check-In"
            />

            <QuickLink
              href="/staff/scout-requests"
              label="Scout Requests"
            />

            {staffUser.role === "ADMIN" && (
  <>
    <QuickLink
      href="/staff/events"
      label="Events"
    />

    <QuickLink
      href="/staff/users"
      label="Staff"
    />
  </>
)}

          </div>
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
      <div className="text-xs font-black uppercase tracking-[0.12em] text-white/35">
        {label}
      </div>

      <div className="mt-3 text-4xl font-black">
        {value.toLocaleString("en-GB")}
      </div>

      <div className="mt-2 text-sm text-white/45">
        {description}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="text-xs uppercase tracking-[0.1em] text-white/35">
        {label}
      </div>

      <div className="mt-2 text-2xl font-black">
        {value.toLocaleString("en-GB")}
      </div>
    </div>
  );
}

function QuickLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-full border border-white/10 bg-black/20 px-5 py-3 text-xs font-black uppercase tracking-[0.08em] text-white/60 transition hover:border-[#c7ff2f]/30 hover:text-white"
    >
      {label}
    </Link>
  );
}
