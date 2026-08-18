import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

import CheckInScanner from "@/components/staff/CheckInScanner";

import {
  checkInPlayer,
  checkInProfessional,
} from "./actions";

type CheckInPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function StaffCheckInPage({
  searchParams,
}: CheckInPageProps) {
  await requireStaffUser();

  const params = await searchParams;
  const q = (params.q || "").trim();

  const activeEvent =
    await prisma.event.findFirst({
      where: {
        active: true,
      },
    });

  if (!activeEvent) {
    return (
      <main className="min-h-screen bg-[#090909] text-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          No active ASCEND event is configured.
        </div>
      </main>
    );
  }

  const [
    totalPlayers,
    checkedInPlayers,
    totalProfessionals,
    checkedInProfessionals,
    players,
    professionals,
  ] = await Promise.all([
    prisma.registration.count({
      where: {
        eventId: activeEvent.id,
        status: "PAID",
        archivedAt: null,
      },
    }),

    prisma.registration.count({
      where: {
        eventId: activeEvent.id,
        status: "PAID",
        archivedAt: null,
        checkedInAt: {
          not: null,
        },
      },
    }),

    prisma.professionalRegistration.count({
      where: {
        eventId: activeEvent.id,
        archivedAt: null,
        status: {
          in: [
            "APPROVED",
            "ACCREDITED",
            "CHECKED_IN",
          ],
        },
      },
    }),

    prisma.professionalRegistration.count({
      where: {
        eventId: activeEvent.id,
        archivedAt: null,
        checkedInAt: {
          not: null,
        },
      },
    }),

    prisma.registration.findMany({
      where: {
        eventId: activeEvent.id,
        archivedAt: null,
        status: "PAID",

        ...(q
          ? {
              OR: [
                {
                  firstName: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
                {
                  lastName: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
                {
                  registrationNumber: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
                {
                  email: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      },

      orderBy: [
        {
          checkedInAt: "desc",
        },
        {
          firstName: "asc",
        },
      ],

      take: q ? 50 : 15,
    }),

    prisma.professionalRegistration.findMany({
      where: {
        eventId: activeEvent.id,
        archivedAt: null,

        status: {
          in: [
            "APPROVED",
            "ACCREDITED",
            "CHECKED_IN",
          ],
        },

        ...(q
          ? {
              OR: [
                {
                  fullName: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
                {
                  email: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
                {
                  accreditationNumber: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      },

      orderBy: [
        {
          checkedInAt: "desc",
        },
        {
          fullName: "asc",
        },
      ],

      take: q ? 50 : 15,
    }),
  ]);

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <section className="mx-auto max-w-[1500px] px-6 py-12 lg:px-8">
        <Link
          href="/staff/dashboard"
          className="text-sm text-white/40 transition hover:text-white"
        >
          ← Back Office
        </Link>

        <div className="mt-6">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
            Event Operations
          </div>

          <h1 className="mt-3 text-4xl font-black">
            Event Check-In
          </h1>

          <p className="mt-3 text-white/50">
            {activeEvent.edition} · Search, verify,
            check in and issue event credentials.
          </p>
        </div>

        {/* COUNTERS */}

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            label="Players"
            value={totalPlayers}
          />

          <Metric
            label="Players Checked In"
            value={checkedInPlayers}
            accent
          />

          <Metric
            label="Professionals"
            value={totalProfessionals}
          />

          <Metric
            label="Professionals Checked In"
            value={checkedInProfessionals}
            accent
          />
        </div>

        {/* QR SCANNER */}

        <div className="mt-8">
           <CheckInScanner />
        </div>

        {/* SEARCH */}

        <form className="mt-8 flex gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name, registration number, accreditation number or email"
            autoFocus
            className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
          />

          <button
            type="submit"
            className="rounded-full bg-[#c7ff2f] px-7 py-3 text-xs font-black uppercase tracking-[0.08em] text-black"
          >
            Search
          </button>

          {q && (
            <Link
              href="/staff/checkin"
              className="rounded-full border border-white/10 px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-white/50"
            >
              Clear
            </Link>
          )}
        </form>

        {/* PLAYERS */}

        <CheckInSection
          title="Players"
          count={players.length}
        >
          {players.map((player) => (
            <CheckInRow
              key={player.id}
              name={`${player.firstName || ""} ${
                player.lastName || ""
              }`.trim()}
              type="Player"
              credential={
                player.registrationNumber ||
                "Registration pending"
              }
              checkedInAt={player.checkedInAt}
              viewHref={`/staff/registrations/${player.id}`}
              badgeHref={
                player.checkInToken
                  ? `/checkin/${player.checkInToken}/badge`
                  : null
              }
              checkInForm={
                <form action={checkInPlayer}>
                  <input
                    type="hidden"
                    name="registrationId"
                    value={player.id}
                  />

                  <CheckInButton />
                </form>
              }
            />
          ))}
        </CheckInSection>

        {/* PROFESSIONALS */}

        <CheckInSection
          title="Professionals"
          count={professionals.length}
        >
          {professionals.map(
            (professional) => (
              <CheckInRow
                key={professional.id}
                name={professional.fullName}
                type={formatRole(
                  professional.role,
                )}
                credential={
                  professional.accreditationNumber ||
                  "Accreditation pending"
                }
                checkedInAt={
                  professional.checkedInAt
                }
                viewHref={`/staff/professionals?registration=${professional.id}`}
                badgeHref={
                  professional.checkInToken
                    ? `/professional-checkin/${professional.checkInToken}/badge`
                    : null
                }
                checkInForm={
                  <form
                    action={
                      checkInProfessional
                    }
                  >
                    <input
                      type="hidden"
                      name="registrationId"
                      value={professional.id}
                    />

                    <CheckInButton />
                  </form>
                }
              />
            ),
          )}
        </CheckInSection>
      </section>
    </main>
  );
}

function CheckInSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-white/10">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-6 py-5">
        <h2 className="text-xl font-black">
          {title}
        </h2>

        <div className="text-sm text-white/40">
          {count} shown
        </div>
      </div>

      <div>{children}</div>
    </section>
  );
}

function CheckInRow({
  name,
  type,
  credential,
  checkedInAt,
  viewHref,
  badgeHref,
  checkInForm,
}: {
  name: string;
  type: string;
  credential: string;
  checkedInAt: Date | null;
  viewHref: string;
  badgeHref: string | null;
  checkInForm: React.ReactNode;
}) {
  return (
    <div className="grid gap-5 border-b border-white/5 px-6 py-5 last:border-b-0 lg:grid-cols-[1.3fr_0.8fr_1fr_0.8fr_auto] lg:items-center">
      <div>
        <div className="font-black">
          {name || "Unnamed attendee"}
        </div>
      </div>

      <div>
        <Label>Type</Label>
        <Value>{type}</Value>
      </div>

      <div>
        <Label>Credential</Label>
        <Value>{credential}</Value>
      </div>

      <div>
        <Label>Status</Label>

        {checkedInAt ? (
          <div className="mt-1 font-black text-[#c7ff2f]">
            Checked In
          </div>
        ) : (
          <div className="mt-1 font-bold text-white/45">
            Not Checked In
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <Link
          href={viewHref}
          className="rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.06em] text-white/60 transition hover:text-white"
        >
          View
        </Link>

        {!checkedInAt && checkInForm}

        {checkedInAt && badgeHref && (
          <Link
            href={badgeHref}
            target="_blank"
            className="rounded-full border border-[#c7ff2f]/30 px-4 py-2 text-xs font-black uppercase tracking-[0.06em] text-[#c7ff2f] transition hover:bg-[#c7ff2f]/10"
          >
            Print Badge
          </Link>
        )}
      </div>
    </div>
  );
}

function CheckInButton() {
  return (
    <button
      type="submit"
      className="rounded-full bg-[#c7ff2f] px-4 py-2 text-xs font-black uppercase tracking-[0.06em] text-black"
    >
      Check In
    </button>
  );
}

function Metric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
      <div className="text-xs font-black uppercase tracking-[0.08em] text-white/35">
        {label}
      </div>

      <div
        className={`mt-3 text-4xl font-black ${
          accent
            ? "text-[#c7ff2f]"
            : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Label({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="text-xs uppercase tracking-[0.08em] text-white/30">
      {children}
    </div>
  );
}

function Value({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-1 text-sm text-white/70">
      {children}
    </div>
  );
}

function formatRole(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}
