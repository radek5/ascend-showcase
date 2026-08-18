import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireStaffAdmin } from "@/lib/staff/auth";
import { restoreRegistration } from "./actions";

export default async function ArchivedRegistrationsPage() {
  await requireStaffAdmin();

  const registrations = await prisma.registration.findMany({
    where: {
      archivedAt: {
        not: null,
      },
    },

    orderBy: {
      archivedAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <Link
              href="/staff/registrations"
              className="text-sm text-white/40 transition hover:text-white"
            >
              ← Registrations
            </Link>

            <div className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
              Lagos 2027
            </div>

            <h1 className="mt-3 text-4xl font-black">
              Archived Registrations
            </h1>

            <p className="mt-3 text-white/50">
              Archived player registrations can be restored at any time.
            </p>
          </div>

          <div className="rounded-full border border-white/10 px-5 py-3 text-sm">
            <span className="text-white/40">Archived</span>{" "}
            <span className="font-black">
              {registrations.length}
            </span>
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.08em] text-white/35">
              <tr>
                <th className="px-6 py-4">
                  Player
                </th>

                <th className="px-6 py-4">
                  Registration
                </th>

                <th className="px-6 py-4">
                  Status
                </th>

                <th className="px-6 py-4">
                  Archived
                </th>

                <th className="px-6 py-4">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {registrations.map((registration) => (
                <tr
                  key={registration.id}
                  className="border-t border-white/5"
                >
                  <td className="px-6 py-5">
                    <div className="font-black">
                      {registration.firstName || "—"}{" "}
                      {registration.lastName || ""}
                    </div>

                    <div className="mt-1 text-xs text-white/35">
                      {registration.email ||
                        registration.guardianEmail ||
                        "No email"}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <span className="font-mono text-xs text-white/60">
                      {registration.registrationNumber ||
                        "Pending"}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-white/50">
                    {registration.status
                      .toLowerCase()
                      .replaceAll("_", " ")
                      .replace(/\b\w/g, (letter) =>
                        letter.toUpperCase(),
                      )}
                  </td>

                  <td className="px-6 py-5 text-white/40">
                    {registration.archivedAt
                      ? new Intl.DateTimeFormat(
                          "en-GB",
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                          },
                        ).format(
                          registration.archivedAt,
                        )
                      : "—"}
                  </td>

                  <td className="px-6 py-5">
                    <form
                      action={restoreRegistration}
                    >
                      <input
                        type="hidden"
                        name="registrationId"
                        value={registration.id}
                      />

                      <button
                        type="submit"
                        className="rounded-full border border-[#c7ff2f]/30 px-4 py-2 text-xs font-black uppercase tracking-[0.06em] text-[#c7ff2f] transition hover:bg-[#c7ff2f]/10"
                      >
                        Restore
                      </button>
                    </form>
                  </td>
                </tr>
              ))}

              {registrations.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-white/35"
                  >
                    No archived registrations.
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
