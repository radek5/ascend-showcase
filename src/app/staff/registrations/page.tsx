import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

import { archiveRegistration } from "./actions/archiveRegistration";

type RegistrationsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    representation?: string;
    video?: string;
    checkin?: string;
  }>;
};

export default async function RegistrationsPage({
  searchParams,
}: RegistrationsPageProps) {
  await requireStaffUser();

  const params = await searchParams;

  const q = (params.q || "").trim();

  const status =
    params.status &&
    ["DRAFT", "AWAITING_PAYMENT", "PAID", "CANCELLED", "REFUNDED"].includes(
      params.status,
    )
      ? params.status
      : "";

  const representation =
    params.representation &&
    ["REPRESENTED", "UNREPRESENTED_OPEN", "STATUS_UNCLEAR"].includes(
      params.representation,
    )
      ? params.representation
      : "";

  const video = params.video || "";
  const checkin = params.checkin || "";

  const registrations = await prisma.registration.findMany({
    where: {
      archivedAt: null,
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
                registrationNumber: {
                  contains: q,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),

      ...(status
        ? {
            status: status as
              | "DRAFT"
              | "AWAITING_PAYMENT"
              | "PAID"
              | "CANCELLED"
              | "REFUNDED",
          }
        : {}),

      ...(representation
        ? {
            representationStatus:
              representation as
                | "REPRESENTED"
                | "UNREPRESENTED_OPEN"
                | "STATUS_UNCLEAR",
          }
        : {}),

      ...(video === "submitted"
        ? {
            videos: {
              some: {
                status: {
                  in: ["SUBMITTED", "PROCESSING", "READY"],
                },
              },
            },
          }
        : {}),

      ...(video === "missing"
        ? {
            videos: {
              none: {},
            },
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

    include: {
      payments: {
        where: {
          status: "PAID",
        },
        orderBy: {
          paidAt: "desc",
        },
      },

      videos: true,

      representationDeclaration: true,
    },

    orderBy: {
      createdAt: "desc",
    },

    take: 250,
  });

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
              Registrations
            </h1>

            <p className="mt-3 text-white/50">
              Search, filter and manage ASCEND Football Showcase players.
            </p>
          </div>

        <div className="flex items-center gap-3">
  <Link
    href="/staff/registrations/archived"
    className="rounded-full border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-[0.06em] text-white/50 transition hover:border-[#c7ff2f]/30 hover:text-[#c7ff2f]"
  >
    Archived
  </Link>

  <div className="rounded-full border border-white/10 bg-white/[0.025] px-5 py-3 text-sm">
    <span className="text-white/40">
      Results
    </span>{" "}
    <span className="font-black text-white">
      {registrations.length}
    </span>
  </div>
</div>
        </div>

        <form className="mt-10 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5 md:grid-cols-2 xl:grid-cols-6">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name, email or registration no."
            className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#c7ff2f]/60 xl:col-span-2"
          />

          <select
            name="status"
            defaultValue={status}
            className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm outline-none focus:border-[#c7ff2f]/60"
          >
            <option value="">All payment statuses</option>
            <option value="PAID">Paid</option>
            <option value="AWAITING_PAYMENT">Awaiting payment</option>
            <option value="DRAFT">Draft</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          <select
            name="representation"
            defaultValue={representation}
            className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm outline-none focus:border-[#c7ff2f]/60"
          >
            <option value="">All representation</option>
            <option value="REPRESENTED">Represented</option>
            <option value="UNREPRESENTED_OPEN">Unrepresented</option>
            <option value="STATUS_UNCLEAR">Status unclear</option>
          </select>

          <select
            name="video"
            defaultValue={video}
            className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm outline-none focus:border-[#c7ff2f]/60"
          >
            <option value="">All video statuses</option>
            <option value="submitted">Video submitted</option>
            <option value="missing">No video</option>
          </select>

          <select
            name="checkin"
            defaultValue={checkin}
            className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm outline-none focus:border-[#c7ff2f]/60"
          >
            <option value="">All check-in statuses</option>
            <option value="yes">Checked in</option>
            <option value="no">Not checked in</option>
          </select>

          <div className="flex gap-3 xl:col-span-6">
            <button
              type="submit"
              className="rounded-full bg-[#c7ff2f] px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-black"
            >
              Apply Filters
            </button>

            <Link
              href="/staff/registrations"
              className="rounded-full border border-white/10 px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-white/50 transition hover:text-white"
            >
              Clear
            </Link>
          </div>
        </form>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-[0.08em] text-white/35">
              <tr>
                <th className="px-5 py-4">Player</th>
                <th className="px-5 py-4">Registration</th>
                <th className="px-5 py-4">Position</th>
                <th className="px-5 py-4">Representation</th>
                <th className="px-5 py-4">ASCEND Interest</th>
                <th className="px-5 py-4">Payment</th>
                <th className="px-5 py-4">Video</th>
                <th className="px-5 py-4">Check-in</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>

            <tbody>
              {registrations.map((registration) => {
                const paidPayment =
                  registration.payments[0] ?? null;

                const hasVideo =
                  registration.videos.some((video) =>
                    ["SUBMITTED", "PROCESSING", "READY"].includes(
                      video.status,
                    ),
                  );

                const interestedInAscend =
                  registration.representationStatus ===
                    "UNREPRESENTED_OPEN" &&
                  registration.representationDeclaration
                    ?.interestedInAscendRepresentation === true;

                return (
                  <tr
                    key={registration.id}
                    className="border-t border-white/5 transition hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-5">
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

                    <td className="px-5 py-5">
                      <div className="font-mono text-xs text-white/70">
                        {registration.registrationNumber || "Pending"}
                      </div>

                      <div className="mt-1 text-xs text-white/30">
                        {new Intl.DateTimeFormat("en-GB", {
                          dateStyle: "medium",
                        }).format(registration.createdAt)}
                      </div>
                    </td>

                    <td className="px-5 py-5 text-white/70">
                      {registration.primaryPosition || "—"}
                    </td>

                    <td className="px-5 py-5">
                      <StatusBadge
                        value={
                          registration.representationStatus ===
                          "REPRESENTED"
                            ? "Represented"
                            : registration.representationStatus ===
                                "UNREPRESENTED_OPEN"
                              ? "Unrepresented"
                              : "Unknown"
                        }
                      />
                    </td>

                    <td className="px-5 py-5">
                      {interestedInAscend ? (
                        <span className="font-black text-[#c7ff2f]">
                          YES
                        </span>
                      ) : (
                        <span className="text-white/25">—</span>
                      )}
                    </td>

                    <td className="px-5 py-5">
                      {paidPayment ? (
                        <div>
                          <div className="font-black text-[#c7ff2f]">
                            Paid
                          </div>

                          <div className="mt-1 text-xs text-white/40">
                            {formatMoney(
                              paidPayment.amount,
                              paidPayment.currency,
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-white/40">
                          {formatStatus(registration.status)}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-5">
                      {hasVideo ? (
                        <span className="text-[#c7ff2f]">
                          Submitted
                        </span>
                      ) : (
                        <span className="text-white/30">
                          Missing
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-5">
                      {registration.checkedInAt ? (
                        <span className="text-[#c7ff2f]">
                          Checked in
                        </span>
                      ) : (
                        <span className="text-white/30">
                          Not checked in
                        </span>
                      )}
                    </td>

<td className="px-5 py-5">
  <div className="flex justify-end gap-2">
    <Link
      href={`/staff/registrations/${registration.id}`}
      className="rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.06em] text-white/60 transition hover:border-[#c7ff2f]/30 hover:text-[#c7ff2f]"
    >
      View
    </Link>

    <form action={archiveRegistration}>
      <input
        type="hidden"
        name="registrationId"
        value={registration.id}
      />

      <button
        type="submit"
        className="rounded-full border border-red-400/20 px-4 py-2 text-xs font-black uppercase tracking-[0.06em] text-red-300 transition hover:border-red-400/40 hover:bg-red-400/[0.05]"
      >
        Archive
      </button>
    </form>
  </div>
</td>
                  </tr>
                );
              })}

              {registrations.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-16 text-center text-white/35"
                  >
                    No registrations match these filters.
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

function StatusBadge({
  value,
}: {
  value: string;
}) {
  return (
    <span className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-bold text-white/60">
      {value}
    </span>
  );
}

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatMoney(
  amountInMinorUnits: number,
  currency: string,
) {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
    }).format(amountInMinorUnits / 100);
  } catch {
    return `${currency} ${(amountInMinorUnits / 100).toFixed(2)}`;
  }
}
