import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

type ExpensePageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

export default async function ExpenseLedgerPage({
  searchParams,
}: ExpensePageProps) {
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
    "PLANNED",
    "QUOTED",
    "APPROVED",
    "COMMITTED",
    "PART_PAID",
    "PAID",
    "CANCELLED",
  ];

  const expenses =
    await prisma.financeExpense.findMany({
      where: {
        eventId: activeEvent.id,

        ...(selectedStatus !== "ALL" &&
        validStatuses.includes(selectedStatus)
          ? {
              status: selectedStatus as
                | "PLANNED"
                | "QUOTED"
                | "APPROVED"
                | "COMMITTED"
                | "PART_PAID"
                | "PAID"
                | "CANCELLED",
            }
          : {}),
      },

      include: {
        category: true,
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
              Expense Ledger
            </h1>

            <p className="mt-3 text-white/50">
              Complete expenditure history for{" "}
              {activeEvent.edition}.
            </p>
          </div>

          <Link
            href="/staff/finance/expenses/new"
            className="rounded-full bg-[#c7ff2f] px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-black"
          >
            Add Expense
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          <StatusFilter
            label="All"
            status="ALL"
            active={selectedStatus === "ALL"}
          />

          <StatusFilter
            label="Planned"
            status="PLANNED"
            active={selectedStatus === "PLANNED"}
          />

          <StatusFilter
            label="Quoted"
            status="QUOTED"
            active={selectedStatus === "QUOTED"}
          />

          <StatusFilter
            label="Approved"
            status="APPROVED"
            active={selectedStatus === "APPROVED"}
          />

          <StatusFilter
            label="Committed"
            status="COMMITTED"
            active={selectedStatus === "COMMITTED"}
          />

          <StatusFilter
            label="Part Paid"
            status="PART_PAID"
            active={selectedStatus === "PART_PAID"}
          />

          <StatusFilter
            label="Paid"
            status="PAID"
            active={selectedStatus === "PAID"}
          />

          <StatusFilter
            label="Archived"
            status="CANCELLED"
            active={selectedStatus === "CANCELLED"}
          />
        </div>

        <section className="mt-8 overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto] gap-4 border-b border-white/10 bg-white/[0.03] px-6 py-4 text-xs font-black uppercase tracking-[0.08em] text-white/30">
            <div>Expense</div>
            <div>Status</div>
            <div>Committed</div>
            <div>Paid</div>
            <div>Outstanding</div>
            <div />
          </div>

          {expenses.length === 0 ? (
            <div className="px-6 py-12 text-sm text-white/35">
              No expense records found.
            </div>
          ) : (
            <div>
              {expenses.map((expense) => {
                const committed =
                  expense.committedAmount ??
                  expense.forecastAmount ??
                  expense.budgetAmount ??
                  0n;

                const outstanding =
                  committed > expense.paidAmount
                    ? committed -
                      expense.paidAmount
                    : 0n;

                return (
                  <div
                    key={expense.id}
                    className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-white/5 px-6 py-5 last:border-0"
                  >
                    <div>
                      <div className="font-black">
                        {expense.description}
                      </div>

                      <div className="mt-1 text-xs text-white/35">
                        {expense.category?.name ||
                          "Uncategorised"}

                        {expense.supplierName
                          ? ` · ${expense.supplierName}`
                          : ""}
                      </div>
                    </div>

                    <div>
                      <StatusBadge
                        status={expense.status}
                      />
                    </div>

                    <div className="font-bold">
                      {formatMoney(
                        committed,
                        expense.currency,
                      )}
                    </div>

                    <div className="font-bold">
                      {formatMoney(
                        expense.paidAmount,
                        expense.currency,
                      )}
                    </div>

                    <div className="font-bold">
                      {formatMoney(
                        outstanding,
                        expense.currency,
                      )}
                    </div>

                    <Link
                      href={`/staff/finance/expenses/${expense.id}/edit`}
                      className="rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.06em] text-white/60 transition hover:border-[#c7ff2f]/30 hover:text-[#c7ff2f]"
                    >
                      {expense.status === "CANCELLED"
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
          ? "/staff/finance/expenses"
          : `/staff/finance/expenses?status=${status}`
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
        status === "PAID"
          ? "border-[#c7ff2f]/30 text-[#c7ff2f]"
          : status === "PART_PAID"
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
