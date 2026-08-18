import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

type PaymentsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    currency?: string;
    event?: string;
  }>;
};

export default async function PaymentsPage({
  searchParams,
}: PaymentsPageProps) {
  await requireStaffUser();

  const params = await searchParams;

  const q = (params.q || "").trim();

  const allowedStatuses = [
    "PENDING",
    "PAID",
    "FAILED",
    "CANCELLED",
    "REFUNDED",
    "PARTIALLY_REFUNDED",
  ];

  const status =
    params.status &&
    allowedStatuses.includes(params.status)
      ? params.status
      : "";

  const currency = (params.currency || "").trim();
  const eventSlug = (params.event || "").trim();

  const events = await prisma.event.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      slug: true,
      edition: true,
      active: true,
    },
  });

  const payments = await prisma.payment.findMany({
    where: {
      ...(status
        ? {
            status: status as
              | "PENDING"
              | "PAID"
              | "FAILED"
              | "CANCELLED"
              | "REFUNDED"
              | "PARTIALLY_REFUNDED",
          }
        : {}),

      ...(currency
        ? {
            currency,
          }
        : {}),

      ...(eventSlug
        ? {
            registration: {
              event: {
                slug: eventSlug,
              },
            },
          }
        : {}),

      ...(q
        ? {
            OR: [
              {
                providerReference: {
                  contains: q,
                  mode: "insensitive",
                },
              },
              {
                providerTransaction: {
                  contains: q,
                  mode: "insensitive",
                },
              },
              {
                registration: {
                  firstName: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
              },
              {
                registration: {
                  lastName: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
              },
              {
                registration: {
                  registrationNumber: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
              },
            ],
          }
        : {}),
    },

    include: {
      registration: {
        include: {
          event: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },

    take: 500,
  });

  const [
    paidCount,
    pendingCount,
    failedCount,
    refundedCount,
    revenueByCurrency,
  ] = await Promise.all([
    prisma.payment.count({
      where: {
        status: "PAID",
        ...(eventSlug
          ? {
              registration: {
                event: {
                  slug: eventSlug,
                },
              },
            }
          : {}),
      },
    }),

    prisma.payment.count({
      where: {
        status: "PENDING",
        ...(eventSlug
          ? {
              registration: {
                event: {
                  slug: eventSlug,
                },
              },
            }
          : {}),
      },
    }),

    prisma.payment.count({
      where: {
        status: "FAILED",
        ...(eventSlug
          ? {
              registration: {
                event: {
                  slug: eventSlug,
                },
              },
            }
          : {}),
      },
    }),

    prisma.payment.count({
      where: {
        status: {
          in: [
            "REFUNDED",
            "PARTIALLY_REFUNDED",
          ],
        },
        ...(eventSlug
          ? {
              registration: {
                event: {
                  slug: eventSlug,
                },
              },
            }
          : {}),
      },
    }),

    prisma.payment.groupBy({
      by: ["currency"],

      where: {
        status: "PAID",

        ...(eventSlug
          ? {
              registration: {
                event: {
                  slug: eventSlug,
                },
              },
            }
          : {}),
      },

      _sum: {
        amount: true,
      },

      orderBy: {
        currency: "asc",
      },
    }),
  ]);

  const currencies = Array.from(
    new Set(
      payments.map((payment) => payment.currency),
    ),
  ).sort();

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <section className="mx-auto max-w-[1500px] px-6 py-12 lg:px-8">
        <Link
          href="/staff/dashboard"
          className="text-sm text-white/40 transition hover:text-white"
        >
          ← Back Office
        </Link>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
              Finance
            </div>

            <h1 className="mt-3 text-4xl font-black">
              Payments & Revenue
            </h1>

            <p className="mt-3 text-white/50">
              Monitor Showcase payments, revenue and transaction activity.
            </p>
          </div>

          <div className="rounded-full border border-white/10 px-5 py-3 text-sm">
            <span className="text-white/40">
              Transactions
            </span>{" "}
            <span className="font-black">
              {payments.length}
            </span>
          </div>
        </div>

        {/* REVENUE */}

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-[#c7ff2f]/20 bg-[#c7ff2f]/[0.04] p-6">
            <div className="text-xs font-black uppercase tracking-[0.1em] text-[#c7ff2f]">
              Revenue
            </div>

            <div className="mt-4 space-y-2">
              {revenueByCurrency.length > 0 ? (
                revenueByCurrency.map((item) => (
                  <div
                    key={item.currency}
                    className="text-xl font-black"
                  >
                    {formatMoney(
                      item._sum.amount ?? 0,
                      item.currency,
                    )}
                  </div>
                ))
              ) : (
                <div className="text-3xl font-black">
                  —
                </div>
              )}
            </div>
          </div>

          <MetricCard
            label="Paid"
            value={paidCount}
          />

          <MetricCard
            label="Pending"
            value={pendingCount}
          />

          <MetricCard
            label="Failed"
            value={failedCount}
          />

          <MetricCard
            label="Refunded"
            value={refundedCount}
          />
        </div>

        {/* FILTERS */}

        <form className="mt-10 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5 md:grid-cols-2 xl:grid-cols-5">
          <input
            name="q"
            defaultValue={q}
            placeholder="Player, registration or reference"
            className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#c7ff2f]/60"
          />

          <select
            name="event"
            defaultValue={eventSlug}
            className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm"
          >
            <option value="">
              All events
            </option>

            {events.map((event) => (
              <option
                key={event.id}
                value={event.slug}
              >
                {event.edition}
                {event.active ? " — Active" : ""}
              </option>
            ))}
          </select>

          <select
            name="status"
            defaultValue={status}
            className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm"
          >
            <option value="">
              All statuses
            </option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">
              Cancelled
            </option>
            <option value="REFUNDED">
              Refunded
            </option>
            <option value="PARTIALLY_REFUNDED">
              Partially refunded
            </option>
          </select>

          <select
            name="currency"
            defaultValue={currency}
            className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm"
          >
            <option value="">
              All currencies
            </option>

            {currencies.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>

          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-full bg-[#c7ff2f] px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-black"
            >
              Apply
            </button>

            <Link
              href="/staff/payments"
              className="rounded-full border border-white/10 px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-white/50"
            >
              Clear
            </Link>
          </div>
        </form>

        {/* TABLE */}

        <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.08em] text-white/35">
              <tr>
                <th className="px-5 py-4">
                  Player
                </th>
                <th className="px-5 py-4">
                  Registration
                </th>
                <th className="px-5 py-4">
                  Event
                </th>
                <th className="px-5 py-4">
                  Amount
                </th>
                <th className="px-5 py-4">
                  Status
                </th>
                <th className="px-5 py-4">
                  Provider
                </th>
                <th className="px-5 py-4">
                  Reference
                </th>
                <th className="px-5 py-4">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-t border-white/5"
                >
                  <td className="px-5 py-5">
                    <Link
                      href={`/staff/registrations/${payment.registration.id}`}
                      className="font-black hover:text-[#c7ff2f]"
                    >
                      {payment.registration.firstName ||
                        "—"}{" "}
                      {payment.registration.lastName ||
                        ""}
                    </Link>

                    <div className="mt-1 text-xs text-white/35">
                      {payment.registration.email ||
                        "No email"}
                    </div>
                  </td>

                  <td className="px-5 py-5 font-mono text-xs text-white/60">
                    {payment.registration
                      .registrationNumber ||
                      "Pending"}
                  </td>

                  <td className="px-5 py-5 text-white/60">
                    {
                      payment.registration.event
                        .edition
                    }
                  </td>

                  <td className="px-5 py-5 font-black">
                    {formatMoney(
                      payment.amount,
                      payment.currency,
                    )}
                  </td>

                  <td className="px-5 py-5">
                    <PaymentStatusBadge
                      status={payment.status}
                    />
                  </td>

                  <td className="px-5 py-5 text-white/60">
                    {payment.provider}
                  </td>

                  <td className="max-w-[220px] break-all px-5 py-5 font-mono text-xs text-white/45">
                    {payment.providerReference ||
                      payment.providerTransaction ||
                      "—"}
                  </td>

                  <td className="px-5 py-5 text-white/45">
                    {formatDateTime(
                      payment.paidAt ||
                        payment.createdAt,
                    )}
                  </td>
                </tr>
              ))}

              {payments.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-16 text-center text-white/35"
                  >
                    No payments match these filters.
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

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
      <div className="text-xs font-black uppercase tracking-[0.1em] text-white/35">
        {label}
      </div>

      <div className="mt-3 text-4xl font-black">
        {value.toLocaleString("en-GB")}
      </div>
    </div>
  );
}

function PaymentStatusBadge({
  status,
}: {
  status: string;
}) {
  const positive = status === "PAID";

  const negative =
    status === "FAILED" ||
    status === "CANCELLED" ||
    status === "REFUNDED";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.05em] ${
        positive
          ? "border-[#c7ff2f]/30 bg-[#c7ff2f]/[0.06] text-[#c7ff2f]"
          : negative
            ? "border-red-400/20 bg-red-400/[0.04] text-red-300"
            : "border-white/10 bg-white/[0.03] text-white/50"
      }`}
    >
      {formatStatus(status)}
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

function formatDateTime(
  value: Date | null | undefined,
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(value);
}

function formatMoney(
  amountInMinorUnits: number,
  currency: string,
) {
  try {
    return new Intl.NumberFormat(
      "en-GB",
      {
        style: "currency",
        currency,
      },
    ).format(amountInMinorUnits / 100);
  } catch {
    return `${currency} ${(amountInMinorUnits / 100).toFixed(2)}`;
  }
}
