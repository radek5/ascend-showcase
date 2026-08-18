import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireStaffAdmin } from "@/lib/staff/auth";

import PermanentDeleteButton from "@/components/staff/PermanentDeleteButton";

import {
  restorePlayer,
  restoreProfessional,
} from "./actions";

type ArchivePageProps = {
  searchParams: Promise<{
    q?: string;
    type?: string;
  }>;
};

export default async function ArchivePage({
  searchParams,
}: ArchivePageProps) {
  await requireStaffAdmin();

  const params = await searchParams;

  const q = (params.q || "").trim();

  const type =
    params.type === "players" ||
    params.type === "professionals"
      ? params.type
      : "all";

  const [players, professionals] = await Promise.all([
    type !== "professionals"
      ? prisma.registration.findMany({
          where: {
            archivedAt: {
              not: null,
            },

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
                      email: {
                        contains: q,
                        mode: "insensitive",
                      },
                    },
                    {
                      guardianEmail: {
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
                  ],
                }
              : {}),
          },

          include: {
            event: true,
          },

          orderBy: {
            archivedAt: "desc",
          },
        })
      : [],

    type !== "players"
      ? prisma.professionalRegistration.findMany({
          where: {
            archivedAt: {
              not: null,
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

          include: {
            event: true,
          },

          orderBy: {
            archivedAt: "desc",
          },
        })
      : [],
  ]);

  const records = [
    ...players.map((player) => ({
      id: player.id,
      kind: "PLAYER" as const,
      name:
        `${player.firstName ?? ""} ${player.lastName ?? ""}`.trim() ||
        "Unnamed Player",
      email:
        player.email ||
        player.guardianEmail ||
        "No email",
      typeLabel: "Player",
      event: player.event.edition,
      identifier:
        player.registrationNumber || "Pending",
      status: player.status,
      archivedAt: player.archivedAt!,
      viewHref:
        `/staff/registrations/${player.id}`,
    })),

    ...professionals.map((professional) => ({
      id: professional.id,
      kind: "PROFESSIONAL" as const,
      name: professional.fullName,
      email: professional.email,
      typeLabel:
        professional.role.replaceAll("_", " "),
      event: professional.event.edition,
      identifier:
        professional.accreditationNumber ||
        "Not issued",
      status: professional.status,
      archivedAt: professional.archivedAt!,
      viewHref:
        `/staff/professionals/${professional.id}`,
    })),
  ].sort(
    (a, b) =>
      b.archivedAt.getTime() -
      a.archivedAt.getTime(),
  );

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <section className="mx-auto max-w-[1500px] px-6 py-12 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <Link
              href="/staff/people"
              className="text-sm text-white/40 transition hover:text-white"
            >
              ← Players & Professionals
            </Link>

            <div className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
              Lagos 2027
            </div>

            <h1 className="mt-3 text-4xl font-black">
              Archive
            </h1>

            <p className="mt-3 text-white/50">
              Historical player and professional event records.
            </p>
          </div>

          <div className="rounded-full border border-white/10 px-5 py-3 text-sm">
            <span className="text-white/40">
              Archived
            </span>{" "}
            <span className="font-black">
              {records.length}
            </span>
          </div>
        </div>

        <form className="mt-10 flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search name, email or accreditation"
            className="min-w-[280px] flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#c7ff2f]/60"
          />

          <select
            name="type"
            defaultValue={type}
            className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm outline-none"
          >
            <option value="all">All</option>
            <option value="players">Players</option>
            <option value="professionals">
              Professionals
            </option>
          </select>

          <button
            type="submit"
            className="rounded-full bg-[#c7ff2f] px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-black"
          >
            Apply
          </button>

          <Link
            href="/staff/archive"
            className="rounded-full border border-white/10 px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-white/50"
          >
            Clear
          </Link>
        </form>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-[1100px] w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.08em] text-white/35">
              <tr>
                <th className="px-6 py-4">Person</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4">
                  Registration / Accreditation
                </th>
                <th className="px-6 py-4">
                  Previous Status
                </th>
                <th className="px-6 py-4">
                  Archived
                </th>
                <th className="px-6 py-4">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {records.map((record) => (
                <tr
                  key={`${record.kind}-${record.id}`}
                  className="border-t border-white/5"
                >
                  <td className="px-6 py-5">
                    <div className="font-black">
                      {record.name}
                    </div>

                    <div className="mt-1 text-xs text-white/35">
                      {record.email}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-bold uppercase text-white/60">
                      {record.typeLabel}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-white/60">
                    {record.event}
                  </td>

                  <td className="px-6 py-5 font-mono text-xs text-white/60">
                    {record.identifier}
                  </td>

                  <td className="px-6 py-5 text-white/50">
                    {record.status
                      .toLowerCase()
                      .replaceAll("_", " ")
                      .replace(/\b\w/g, (letter) =>
                        letter.toUpperCase(),
                      )}
                  </td>

                  <td className="px-6 py-5 text-white/40">
                    {new Intl.DateTimeFormat(
                      "en-GB",
                      {
                        dateStyle: "medium",
                        timeStyle: "short",
                      },
                    ).format(record.archivedAt)}
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex gap-2">
                      <Link
                        href={record.viewHref}
                        className="rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.06em] text-white/50 transition hover:text-white"
                      >
                        View
                      </Link>

                      <form
                        action={
                          record.kind === "PLAYER"
                            ? restorePlayer
                            : restoreProfessional
                        }
                      >
                        <input
                          type="hidden"
                          name="id"
                          value={record.id}
                        />

                        <button
                          type="submit"
                          className="rounded-full border border-[#c7ff2f]/30 px-4 py-2 text-xs font-black uppercase tracking-[0.06em] text-[#c7ff2f] transition hover:bg-[#c7ff2f]/10"
                        >
                          Restore
                        </button>
                      </form>
                     
                       <PermanentDeleteButton
                         id={record.id}
                         kind={record.kind}
                       />
                     </div>
                    </td>
                </tr>
              ))}

              {records.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center text-white/35"
                  >
                    No archived records.
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
