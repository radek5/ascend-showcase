import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

import { archiveProfessional } from "./actions/archiveProfessional";

type ProfessionalsPageProps = {
  searchParams: Promise<{
    q?: string;
    role?: string;
    status?: string;
    transfer?: string;
    checkin?: string;
  }>;
};

export default async function ProfessionalsPage({
  searchParams,
}: ProfessionalsPageProps) {
  await requireStaffUser();

  const params = await searchParams;

  const q = (params.q || "").trim();

  const role =
    params.role &&
    [
      "CLUB_REPRESENTATIVE",
      "SCOUT",
      "FOOTBALL_AGENT",
    ].includes(params.role)
      ? params.role
      : "";

  const status =
    params.status &&
    [
      "DRAFT",
      "SUBMITTED",
      "UNDER_REVIEW",
      "APPROVED",
      "MORE_INFO_REQUIRED",
      "REJECTED",
      "ACCREDITED",
      "CHECKED_IN",
    ].includes(params.status)
      ? params.status
      : "";

  const transfer = params.transfer || "";
  const checkin = params.checkin || "";

  const [
    professionals,
    totalCount,
    clubRepCount,
    scoutCount,
    agentCount,
    accreditedCount,
    checkedInCount,
  ] = await Promise.all([
    prisma.professionalRegistration.findMany({
      where: {
        archivedAt: null,

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
                {
                  arrivalFlight: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
                {
                  departureFlight: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),

        ...(role
          ? {
              role: role as
                | "CLUB_REPRESENTATIVE"
                | "SCOUT"
                | "FOOTBALL_AGENT",
            }
          : {}),

        ...(status
          ? {
              status: status as
                | "DRAFT"
                | "SUBMITTED"
                | "UNDER_REVIEW"
                | "APPROVED"
                | "MORE_INFO_REQUIRED"
                | "REJECTED"
                | "ACCREDITED"
                | "CHECKED_IN",
            }
          : {}),

        ...(transfer === "required"
          ? {
              OR: [
                {
                  arrivalTransfer: true,
                },
                {
                  departureTransfer: true,
                },
              ],
            }
          : {}),

        ...(transfer === "none"
          ? {
              arrivalTransfer: false,
              departureTransfer: false,
            }
          : {}),

        ...(checkin === "yes"
          ? {
              checkedInAt: {
                not: null,
              },
            }
          : {}),

        ...(checkin === "no"
          ? {
              checkedInAt: null,
            }
          : {}),
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 250,
    }),

    prisma.professionalRegistration.count({
      where: {
        archivedAt: null,
      },
    }),

    prisma.professionalRegistration.count({
      where: {
        archivedAt: null,
        role: "CLUB_REPRESENTATIVE",
      },
    }),

    prisma.professionalRegistration.count({
      where: {
        archivedAt: null,
        role: "SCOUT",
      },
    }),

    prisma.professionalRegistration.count({
      where: {
        archivedAt: null,
        role: "FOOTBALL_AGENT",
      },
    }),

    prisma.professionalRegistration.count({
      where: {
        archivedAt: null,
        status: {
          in: ["ACCREDITED", "CHECKED_IN"],
        },
      },
    }),

    prisma.professionalRegistration.count({
      where: {
        archivedAt: null,
        checkedInAt: {
          not: null,
        },
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <section className="mx-auto max-w-[1600px] px-6 py-12 lg:px-8">
        {/* HEADER */}

        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Link
              href="/staff/people"
              className="text-sm text-white/40 transition hover:text-white"
            >
              ← Players & Professionals
            </Link>

            <div className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-[#1685ff]">
              Lagos 2027
            </div>

            <h1 className="mt-3 text-4xl font-black">
              Professional Attendees
            </h1>

            <p className="mt-3 max-w-2xl text-white/50">
              Manage club representatives, scouts, football agents,
              accreditation, travel and professional event check-in.
            </p>
          </div>

          <div className="rounded-full border border-white/10 bg-white/[0.025] px-5 py-3 text-sm">
            <span className="text-white/40">
              Results
            </span>{" "}
            <span className="font-black text-white">
              {professionals.length}
            </span>
          </div>
        </div>

        {/* SUMMARY */}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <SummaryCard
            label="Registered"
            value={totalCount}
          />

          <SummaryCard
            label="Club Reps"
            value={clubRepCount}
          />

          <SummaryCard
            label="Scouts"
            value={scoutCount}
          />

          <SummaryCard
            label="Agents"
            value={agentCount}
          />

          <SummaryCard
            label="Accredited"
            value={accreditedCount}
            highlight
          />

          <SummaryCard
            label="Checked In"
            value={checkedInCount}
            highlight
          />
        </div>

        {/* FILTERS */}

        <form className="mt-10 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5 md:grid-cols-2 xl:grid-cols-6">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name, email, accreditation or flight"
            className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#1685ff]/60 xl:col-span-2"
          />

          <select
            name="role"
            defaultValue={role}
            className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm outline-none focus:border-[#1685ff]/60"
          >
            <option value="">All roles</option>
            <option value="CLUB_REPRESENTATIVE">
              Club Representatives
            </option>
            <option value="SCOUT">
              Scouts
            </option>
            <option value="FOOTBALL_AGENT">
              Football Agents
            </option>
          </select>

          <select
            name="status"
            defaultValue={status}
            className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm outline-none focus:border-[#1685ff]/60"
          >
            <option value="">All accreditation statuses</option>
            <option value="ACCREDITED">
              Accredited
            </option>
            <option value="CHECKED_IN">
              Checked In
            </option>
            <option value="SUBMITTED">
              Submitted
            </option>
            <option value="UNDER_REVIEW">
              Under Review
            </option>
            <option value="APPROVED">
              Approved
            </option>
            <option value="MORE_INFO_REQUIRED">
              More Info Required
            </option>
            <option value="REJECTED">
              Rejected
            </option>
            <option value="DRAFT">
              Draft
            </option>
          </select>

          <select
            name="transfer"
            defaultValue={transfer}
            className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm outline-none focus:border-[#1685ff]/60"
          >
            <option value="">All transfers</option>
            <option value="required">
              Transfer Required
            </option>
            <option value="none">
              No Transfer
            </option>
          </select>

          <select
            name="checkin"
            defaultValue={checkin}
            className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm outline-none focus:border-[#1685ff]/60"
          >
            <option value="">All check-in statuses</option>
            <option value="yes">
              Checked In
            </option>
            <option value="no">
              Not Checked In
            </option>
          </select>

          <div className="flex gap-3 xl:col-span-6">
            <button
              type="submit"
              className="rounded-full bg-[#1685ff] px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-white"
            >
              Apply Filters
            </button>

            <Link
              href="/staff/professionals"
              className="rounded-full border border-white/10 px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-white/50 transition hover:text-white"
            >
              Clear
            </Link>
          </div>
        </form>

        {/* REGISTER */}

        <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-[1400px] w-full border-collapse text-sm">
            <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-[0.08em] text-white/35">
              <tr>
                <th className="px-5 py-4">
                  Attendee
                </th>

                <th className="px-5 py-4">
                  Role
                </th>

                <th className="px-5 py-4">
                  Accreditation
                </th>

                <th className="px-5 py-4">
                  Arrival
                </th>

                <th className="px-5 py-4">
                  Transfer
                </th>

                <th className="px-5 py-4">
                  Accommodation
                </th>

                <th className="px-5 py-4">
                  Status
                </th>

                <th className="px-5 py-4">
                  Check-In
                </th>

                <th className="px-5 py-4"></th>
              </tr>
            </thead>

            <tbody>
              {professionals.map((professional) => (
                <tr
                  key={professional.id}
                  className="border-t border-white/5 transition hover:bg-white/[0.02]"
                >
                  {/* ATTENDEE */}

                  <td className="px-5 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/30">
                        {professional.headshotUrl ? (
                          <img
                            src={`/api/professional-registration/${professional.id}/headshot`}
                            alt={`${professional.fullName} headshot`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs font-black text-white/20">
                            —
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="font-black">
                          {professional.fullName}
                        </div>

                        <div className="mt-1 text-xs text-white/35">
                          {professional.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* ROLE */}

                  <td className="px-5 py-5">
                    <div className="font-semibold">
                      {professional.role.replaceAll(
                        "_",
                        " ",
                      )}
                    </div>
                  </td>

                  {/* ACCREDITATION */}

                  <td className="px-5 py-5">
                    {professional.accreditationNumber ? (
                      <div className="font-black text-[#c7ff2f]">
                        {
                          professional.accreditationNumber
                        }
                      </div>
                    ) : (
                      <span className="text-white/30">
                        Not issued
                      </span>
                    )}
                  </td>

                  {/* ARRIVAL */}

                  <td className="px-5 py-5">
                    {professional.arrivalDate ? (
                      <>
                        <div className="font-semibold">
                          {new Intl.DateTimeFormat(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              timeZone: "UTC",
                            },
                          ).format(
                            professional.arrivalDate,
                          )}
                        </div>

                        <div className="mt-1 text-xs text-white/40">
                          {professional.arrivalTime ||
                            "Time not provided"}
                        </div>

                        {(professional.arrivalAirline ||
                          professional.arrivalFlight) && (
                          <div className="mt-1 text-xs text-white/35">
                            {professional.arrivalAirline ||
                              ""}
                            {professional.arrivalAirline &&
                            professional.arrivalFlight
                              ? " · "
                              : ""}
                            {professional.arrivalFlight ||
                              ""}
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-white/30">
                        Not provided
                      </span>
                    )}
                  </td>

                  {/* TRANSFER */}

                  <td className="px-5 py-5">
                    <div className="space-y-1">
                      <div>
                        <span className="text-white/35">
                          Arrival:
                        </span>{" "}
                        <span
                          className={
                            professional.arrivalTransfer
                              ? "font-bold text-[#c7ff2f]"
                              : "text-white/50"
                          }
                        >
                          {professional.arrivalTransfer
                            ? "YES"
                            : "NO"}
                        </span>
                      </div>

                      <div>
                        <span className="text-white/35">
                          Departure:
                        </span>{" "}
                        <span
                          className={
                            professional.departureTransfer
                              ? "font-bold text-[#c7ff2f]"
                              : "text-white/50"
                          }
                        >
                          {professional.departureTransfer
                            ? "YES"
                            : "NO"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* ACCOMMODATION */}

                  <td className="px-5 py-5">
                    {professional.hotelStatus ? (
                      <div>
                        <div className="font-semibold">
                          {professional.hotelStatus}
                        </div>

                        {professional.lagosAddress && (
                          <div className="mt-1 max-w-[220px] text-xs leading-5 text-white/35">
                            {
                              professional.lagosAddress
                            }
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-white/30">
                        Not provided
                      </span>
                    )}
                  </td>

                  {/* STATUS */}

                  <td className="px-5 py-5">
                    <StatusBadge
                      status={professional.status}
                    />
                  </td>

                  {/* CHECK-IN */}

                  <td className="px-5 py-5">
                    {professional.checkedInAt ? (
                      <div>
                        <div className="font-black text-[#c7ff2f]">
                          CHECKED IN
                        </div>

                        <div className="mt-1 text-xs text-white/35">
                          {new Intl.DateTimeFormat(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone:
                                "Africa/Lagos",
                            },
                          ).format(
                            professional.checkedInAt,
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-white/35">
                        Not checked in
                      </span>
                    )}
                  </td>

                  {/* ACTIONS */}

                  <td className="px-5 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/staff/professionals/${professional.id}`}
                        className="inline-flex rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-white/50 transition hover:border-[#1685ff]/50 hover:text-white"
                      >
                        View
                      </Link>

                      <form action={archiveProfessional}>
                        <input
                          type="hidden"
                          name="registrationId"
                          value={professional.id}
                        />

                        <button
                          type="submit"
                          className="inline-flex rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-white/40 transition hover:border-red-500/30 hover:text-red-400"
                        >
                          Archive
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}

              {professionals.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-16 text-center text-white/35"
                  >
                    No professional attendees match
                    these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <div className="text-xs font-black uppercase tracking-[0.1em] text-white/35">
        {label}
      </div>

      <div
        className={`mt-2 text-3xl font-black ${
          highlight
            ? "text-[#c7ff2f]"
            : "text-white"
        }`}
      >
        {value.toLocaleString("en-GB")}
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const positive =
    status === "ACCREDITED" ||
    status === "CHECKED_IN";

  const negative =
    status === "REJECTED";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.06em] ${
        positive
          ? "border-[#c7ff2f]/20 bg-[#c7ff2f]/[0.06] text-[#c7ff2f]"
          : negative
            ? "border-red-500/20 bg-red-500/[0.06] text-red-400"
            : "border-white/10 bg-white/[0.03] text-white/50"
      }`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
