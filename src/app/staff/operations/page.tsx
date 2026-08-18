import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

export default async function OperationsPage() {
  const staffUser = await requireStaffUser();

  const [
    transferCount,
    checkedInPlayers,
    checkedInProfessionals,
  ] = await Promise.all([
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

          <div className="text-xs font-black uppercase tracking-[0.18em] text-[#1685ff]">
            Lagos 2027
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-[#1685ff]">
          Event Operations
        </div>

        <h1 className="mt-3 text-4xl font-black">
          Showcase Operations
        </h1>

        <p className="mt-4 max-w-2xl text-white/50">
          Manage the operational delivery of ASCEND Lagos 2027.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          <Stat
            label="Airport Transfers"
            value={transferCount}
          />

          <Stat
            label="Players Checked In"
            value={checkedInPlayers}
          />

          <Stat
            label="Professionals Checked In"
            value={checkedInProfessionals}
          />
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <OperationCard
            title="Payments & Revenue"
            text="Payments, payment status and event revenue."
            href="/staff/payments"
          />

          <OperationCard
            title="Airport Transfers"
            text="Arrival and departure transport requirements."
            href="/staff/operations/transfers"
          />

          <OperationCard
            title="Accommodation"
            text="Preferred hotel and alternative Lagos accommodation."
            href="/staff/professionals?view=accommodation"
          />

          <OperationCard
            title="Check-In"
            text="Player and professional event arrival."
            href="/staff/checkin"
          />

          <OperationCard
            title="Scout Requests"
            text="Manage football recruitment and access requests."
            href="/staff/scout-requests"
          />

          {staffUser.role === "ADMIN" && (
            <OperationCard
              title="Staff Management"
              text="Manage authorised ASCEND event staff."
              href="/staff/users"
            />
          )}
        </div>
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
      <div className="text-xs uppercase tracking-[0.12em] text-white/35">
        {label}
      </div>

      <div className="mt-3 text-4xl font-black">
        {value.toLocaleString("en-GB")}
      </div>
    </div>
  );
}

function OperationCard({
  title,
  text,
  href,
}: {
  title: string;
  text: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:border-[#1685ff]/40 hover:bg-[#1685ff]/[0.025]"
    >
      <div className="text-xl font-black">
        {title}
      </div>

      <p className="mt-3 text-sm leading-6 text-white/45">
        {text}
      </p>

      <div className="mt-6 text-xs font-black uppercase tracking-[0.1em] text-[#1685ff]">
        Open →
      </div>
    </Link>
  );
}
