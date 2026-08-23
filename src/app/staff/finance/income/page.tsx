import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

type IncomePageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

export default async function IncomeLedgerPage({
  searchParams,
}: IncomePageProps) {
  await requireStaffUser();

  const params = await searchParams;
  const selectedStatus = String(
    params.status || "ALL",
  ).toUpperCase();

  const activeEvent = await prisma.event.findFirst({
    where: {
      active: true,
    },
  });

  if (!activeEvent) {
    return (
      <main className="min-h-screen bg-[#090909] text-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          No active event found.
        </div>
      </main>
    );
  }

  const validStatuses = [
    "EXPECTED",
    "AGREED",
    "INVOICED",
    "PART_RECEIVED",
    "RECEIVED",
    "CANCELLED",
  ];

  const incomes = await prisma.financeIncome.findMany({
    where: {
      eventId: activeEvent.id,

      ...(selectedStatus !== "ALL" &&
      validStatuses.includes(selectedStatus)
        ? {
            status: selectedStatus as
              | "EXPECTED"
              | "AGREED"
              | "INVOICED"
              | "PART_RECEIVED"
              | "RECEIVED"
              | "CANCELLED",
          }
        : {}),
    },

    include: {
      category: true,

      commercialRelationship: {
        include: {
          organisation: true,
        },
      },
    },

    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <section className="mx-auto max-w-[1500px] px-6 py-12 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <Link
              href="/staff/finance"
              className="text-sm text-white/40 transition hover:text-white"
            >
              ← Financial Health
            </Link>

            <div className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
              Finance
            </div>

            <h1 className="mt-3 text-4xl font-black">
              Income Ledger
            </h1>

            <p className="mt-3 text-white/50">
              Complete income history for{" "}
              {activeEvent.edition}.
            </p>
          </div>

          <Link
            href="/staff/finance/income/new"
            className="rounded-full bg-[#c7ff2f] px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-black"
          >
            Add Income
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          <StatusFilter
            label="All"
            status="ALL"
            active={selectedStatus === "ALL"}
          />

          <StatusFilter
            label="Expected"
            status="EXPECTED"
            active={selectedStatus === "EXPECTED"}
          />

          <StatusFilter
            label="Agreed"
            status="AGREED"
            active={selectedStatus === "AGREED"}
          />

          <StatusFilter
            label="Invoiced"
            status="INVOICED"
            active={selectedStatus === "INVOICED"}
          />

          <StatusFilter
            label="Part Received"
            status="PART_RECEIVED"
            active={
              selectedStatus === "PART_RECEIVED"
            }
          />

          <StatusFilter
            label="Received"
            status="RECEIVED"
            active={selectedStatus === "RECEIVED"}
          />

          <StatusFilter
            label="Archived"
            status="CANCELLED"
            active={selectedStatus === "CANCELLED"}
          />
        </div>

        <section className="mt-8 overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto] gap-4 border-b border-white/10 bg-white/[0.03] px-6 py-4 text-xs font-black uppercase tracking-[0.08em] text-white/30">
            <div>Source</div>
            <div>Status</div>
            <div>Agreed</div>
            <div>Received</div>
            <div>Outstanding</div>
            <div />
          </div>

          {incomes.length === 0 ? (
            <div className="px-6 py-12 text-sm text-white/35">
              No income records found.
            </div>
          ) : (
            <div>
              {incomes.map((income) => {
                const agreed =
                  income.agreedAmount ??
                  income.expectedAmount ??
                  0n;

                const outstanding =
                  agreed > income.receivedAmount
                    ? agreed - income.receivedAmount
                    : 0n;

                return (
                  <div
                    key={income.id}
                    className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-white/5 px-6 py-5 last:border-0"
                  >
                    <div>
                      <div className="font-black">
                        {income.sourceName}
                      </div>

                      <div className="mt-1 text-xs text-white/35">
                        {income.category?.name ||
                          "Uncategorised"}

                        {income.commercialRelationship
                          ?.organisation?.name
                          ? ` · ${income.commercialRelationship.organisation.name}`
                          : ""}
                      </div>
                    </div>

                    <div>
                      <StatusBadge
                        status={income.status}
                      />
                    </div>

                    <div className="font-bold">
                      {formatMoney(
                        agreed,
                        income.currency,
                      )}
                    </div>

                    <div className="font-bold">
                      {formatMoney(
                        income.receivedAmount,
                        income.currency,
                      )}
                    </div>

                    <div className="font-bold">
                      {formatMoney(
                        outstanding,
                        income.currency,
                      )}
                    </div>

                    <Link
                      href={`/staff/finance/income/${income.id}/edit`}
                      className="rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.06em] text-white/60 transition hover:border-[#c7ff2f]/30 hover:text-[#c7ff2f]"
                    >
                      {income.status === "CANCELLED"
                        ? "View"
                        : "Edit"}
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function StatusFilter({
  label,
  status,
  active,
}: {
  label: string;
  status: string;
  active: boolean;
}) {
  return (
    <Link
      href={
        status === "ALL"
          ? "/staff/finance/income"
          : `/staff/finance/income?status=${status}`
      }
      className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.06em] transition ${
        active
          ? "border-[#c7ff2f]/40 bg-[#c7ff2f]/10 text-[#c7ff2f]"
          : "border-white/10 text-white/40 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.06em] ${
        status === "RECEIVED"
          ? "border-[#c7ff2f]/30 text-[#c7ff2f]"
          : status === "PART_RECEIVED"
            ? "border-yellow-400/30 text-yellow-300"
            : status === "CANCELLED"
              ? "border-red-400/25 text-red-300"
              : "border-white/10 text-white/55"
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}

function formatMoney(
  amount: bigint,
  currency: string,
) {
  const majorUnits =
    Number(amount) / 100;

  try {
    return new Intl.NumberFormat(
      "en-GB",
      {
        style: "currency",
        currency,
      },
    ).format(majorUnits);
  } catch {
    return `${currency} ${majorUnits.toFixed(2)}`;
  }
}

function formatStatus(
  value: string,
) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}
