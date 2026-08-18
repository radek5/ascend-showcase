import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

type SearchParams = Promise<{
  q?: string;
  movement?: string;
}>;

function formatDate(date: Date | null) {
  if (!date) return "Not provided";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(date);
}

function roleLabel(role: string) {
  return role
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function AirportTransfersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireStaffUser();

  const params = await searchParams;

  const q = (params.q || "").trim();
  const movement = params.movement || "all";

  const professionals =
    await prisma.professionalRegistration.findMany({
      where: {
        archivedAt: null,

        OR: [
          {
            arrivalTransfer: true,
          },
          {
            departureTransfer: true,
          },
        ],

        ...(q
          ? {
              AND: [
                {
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
                      arrivalAirline: {
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
                      departureAirline: {
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
                },
              ],
            }
          : {}),
      },

      orderBy: [
        {
          arrivalDate: "asc",
        },
        {
          fullName: "asc",
        },
      ],
    });

  const movements = professionals.flatMap(
    (professional) => {
      const rows = [];

      if (
        professional.arrivalTransfer &&
        (movement === "all" ||
          movement === "arrival")
      ) {
        rows.push({
          key: `${professional.id}-arrival`,
          professionalId: professional.id,
          name: professional.fullName,
          email: professional.email,
          phone: professional.phone,
          role: roleLabel(professional.role),
          type: "ARRIVAL",
          date: professional.arrivalDate,
          time: professional.arrivalTime,
          airline: professional.arrivalAirline,
          flight: professional.arrivalFlight,
          accommodation:
            professional.hotelStatus ||
            professional.lagosAddress,
        });
      }

      if (
        professional.departureTransfer &&
        (movement === "all" ||
          movement === "departure")
      ) {
        rows.push({
          key: `${professional.id}-departure`,
          professionalId: professional.id,
          name: professional.fullName,
          email: professional.email,
          phone: professional.phone,
          role: roleLabel(professional.role),
          type: "DEPARTURE",
          date: professional.departureDate,
          time: professional.departureTime,
          airline: professional.departureAirline,
          flight: professional.departureFlight,
          accommodation:
            professional.hotelStatus ||
            professional.lagosAddress,
        });
      }

      return rows;
    },
  );

  movements.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;

    return a.date.getTime() - b.date.getTime();
  });

  const arrivalCount =
    professionals.filter(
      (professional) =>
        professional.arrivalTransfer,
    ).length;

  const departureCount =
    professionals.filter(
      (professional) =>
        professional.departureTransfer,
    ).length;

  const incompleteCount = movements.filter(
    (item) =>
      !item.date ||
      !item.time ||
      !item.airline ||
      !item.flight,
  ).length;

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 lg:px-8">
          <Link
            href="/staff/operations"
            className="text-sm font-bold text-white/50 transition hover:text-white"
          >
            ← Event Operations
          </Link>

          <div className="text-xs font-black uppercase tracking-[0.18em] text-[#1685ff]">
            Lagos 2027
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1600px] px-6 py-12 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.2em] text-[#1685ff]">
              Event Operations
            </div>

            <h1 className="mt-3 text-4xl font-black">
              Airport Transfers
            </h1>

            <p className="mt-3 max-w-2xl text-white/50">
              Arrival and departure transport manifest
              for ASCEND Lagos 2027.
            </p>
          </div>

          <div className="rounded-full border border-white/10 px-5 py-3 text-sm">
            <span className="text-white/40">
              Movements
            </span>{" "}
            <span className="font-black">
              {movements.length}
            </span>
          </div>
        </div>

        {/* SUMMARY */}

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Stat
            label="Airport Arrivals"
            value={arrivalCount}
          />

          <Stat
            label="Airport Departures"
            value={departureCount}
          />

          <Stat
            label="Missing Travel Details"
            value={incompleteCount}
            alert={incompleteCount > 0}
          />
        </div>

        {/* FILTERS */}

        <form className="mt-10 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_260px_auto]">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search name, email, airline or flight"
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#1685ff]/50"
            />

            <select
              name="movement"
              defaultValue={movement}
              className="rounded-xl border border-white/10 bg-[#0b0b0b] px-4 py-3 text-sm text-white outline-none"
            >
              <option value="all">
                All movements
              </option>

              <option value="arrival">
                Arrivals
              </option>

              <option value="departure">
                Departures
              </option>
            </select>

            <button
              type="submit"
              className="rounded-full bg-[#1685ff] px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-white"
            >
              Apply
            </button>
          </div>

          {(q || movement !== "all") && (
            <div className="mt-4">
              <Link
                href="/staff/operations/transfers"
                className="text-xs font-black uppercase tracking-[0.08em] text-white/40 hover:text-white"
              >
                Clear Filters
              </Link>
            </div>
          )}
        </form>

        {/* MANIFEST */}

        <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[1250px] text-left text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.08em] text-white/35">
              <tr>
                <th className="px-5 py-4">
                  Passenger
                </th>

                <th className="px-5 py-4">
                  Movement
                </th>

                <th className="px-5 py-4">
                  Date
                </th>

                <th className="px-5 py-4">
                  Time
                </th>

                <th className="px-5 py-4">
                  Airline
                </th>

                <th className="px-5 py-4">
                  Flight
                </th>

                <th className="px-5 py-4">
                  Accommodation
                </th>

                <th className="px-5 py-4 text-right">
                  Record
                </th>
              </tr>
            </thead>

            <tbody>
              {movements.map((item) => {
                const incomplete =
                  !item.date ||
                  !item.time ||
                  !item.airline ||
                  !item.flight;

                return (
                  <tr
                    key={item.key}
                    className="border-t border-white/5"
                  >
                    <td className="px-5 py-5">
                      <div className="font-black">
                        {item.name}
                      </div>

                      <div className="mt-1 text-xs text-white/35">
                        {item.role}
                      </div>

                      <div className="mt-1 text-xs text-white/35">
                        {item.phone}
                      </div>
                    </td>

                    <td className="px-5 py-5">
                      <span
                        className={`rounded-full border px-3 py-2 text-xs font-black ${
                          item.type === "ARRIVAL"
                            ? "border-[#c7ff2f]/30 text-[#c7ff2f]"
                            : "border-[#1685ff]/30 text-[#1685ff]"
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>

                    <td className="px-5 py-5 font-semibold">
                      {formatDate(item.date)}
                    </td>

                    <td className="px-5 py-5">
                      {item.time || (
                        <span className="text-red-400">
                          Missing
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-5">
                      {item.airline || (
                        <span className="text-red-400">
                          Missing
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-5 font-mono">
                      {item.flight || (
                        <span className="font-sans text-red-400">
                          Missing
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-5 text-white/60">
                      {item.accommodation ||
                        "Not provided"}
                    </td>

                    <td className="px-5 py-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {incomplete && (
                          <span className="text-xs font-black uppercase text-red-400">
                            Incomplete
                          </span>
                        )}

                        <Link
                          href={`/staff/professionals/${item.professionalId}`}
                          className="rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.06em] text-white/50 transition hover:border-[#1685ff]/40 hover:text-white"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {movements.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-16 text-center text-white/35"
                  >
                    No airport transfers match these filters.
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

function Stat({
  label,
  value,
  alert = false,
}: {
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
      <div className="text-xs font-black uppercase tracking-[0.1em] text-white/35">
        {label}
      </div>

      <div
        className={`mt-3 text-4xl font-black ${
          alert ? "text-red-400" : ""
        }`}
      >
        {value.toLocaleString("en-GB")}
      </div>
    </div>
  );
}
