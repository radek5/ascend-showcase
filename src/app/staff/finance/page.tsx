import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

export default async function FinancePage() {
  await requireStaffUser();

  const activeEvent = await prisma.event.findFirst({
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
    paymentTotals,
    expenses,
    manualIncome,
  ] = await Promise.all([
    prisma.payment.groupBy({
      by: ["currency"],

      where: {
        status: "PAID",

        registration: {
          eventId: activeEvent.id,
        },
      },

      _sum: {
        amount: true,
      },
    }),

    prisma.financeExpense.findMany({
      where: {
        eventId: activeEvent.id,
        status: {
          not: "CANCELLED",
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.financeIncome.findMany({
      where: {
        eventId: activeEvent.id,
        status: {
          not: "CANCELLED",
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const playerIncomeByCurrency =
    Object.fromEntries(
      paymentTotals.map((item) => [
        item.currency,
        item._sum.amount || 0n,
      ]),
    );

  const expensePaidByCurrency =
    groupAmounts(
      expenses,
      (item) => item.currency,
      (item) => item.paidAmount,
    );

  const committedByCurrency =
    groupAmounts(
      expenses,
      (item) => item.currency,
      (item) => item.committedAmount || 0n,
    );

  const outstandingCommittedByCurrency =
    groupAmounts(
      expenses,
      (item) => item.currency,
      (item) => {
        const outstanding =
          (item.committedAmount || 0n) -
          item.paidAmount;

        return outstanding > 0n
          ? outstanding
          : 0n;
      },
  );

  const manualIncomeByCurrency =
    groupAmounts(
      manualIncome,
      (item) => item.currency,
      (item) => item.receivedAmount,
    );

  const currencies = Array.from(
    new Set([
      ...Object.keys(playerIncomeByCurrency),
      ...Object.keys(expensePaidByCurrency),
      ...Object.keys(committedByCurrency),
      ...Object.keys(manualIncomeByCurrency),
      "NGN",
    ]),
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
              Financial Health
            </h1>

            <p className="mt-3 max-w-2xl text-white/50">
              Live financial position for {activeEvent.edition}.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/staff/finance/income/new"
              className="rounded-full border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-[0.08em] text-white/65"
            >
              Add Income
            </Link>

            <Link
              href="/staff/finance/expenses/new"
              className="rounded-full bg-[#c7ff2f] px-5 py-3 text-xs font-black uppercase tracking-[0.08em] text-black"
            >
              Add Expense
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-2">
          {currencies.map((currency) => {
            const playerIncome =
              playerIncomeByCurrency[currency] || 0n;

            const otherIncome =
              manualIncomeByCurrency[currency] || 0n;

            const received =
              playerIncome + otherIncome;

            const spent =
              expensePaidByCurrency[currency] || 0n;

            const committed =
              committedByCurrency[currency] || 0n;

            const outstandingCommitted =
              outstandingCommittedByCurrency[currency] || 0n;

            const cashPosition =
              received - spent;

            const availableAfterCommitments =
              cashPosition - outstandingCommitted;

            const fifteenPercentOfReceived =
  (received * 15n) / 100n;

const healthStatus =
  availableAfterCommitments < 0n
    ? "AT RISK"
    : outstandingCommitted > 0n &&
        availableAfterCommitments <
          fifteenPercentOfReceived
      ? "WATCH"
      : "HEALTHY";

            return (
              <section
                key={currency}
                className="rounded-[2rem] border border-white/10 bg-white/[0.025] p-7"
              >
                <div className="text-xs font-black uppercase tracking-[0.18em] text-[#c7ff2f]">
                  {currency}
                </div>

                <div className="mt-3 flex items-center gap-3">
  <span
    className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.08em] ${
      healthStatus === "HEALTHY"
        ? "border-[#c7ff2f]/30 text-[#c7ff2f]"
        : healthStatus === "WATCH"
          ? "border-yellow-400/30 text-yellow-300"
          : "border-red-400/30 text-red-300"
    }`}
  >
    {healthStatus}
  </span>

  <span className="text-xs text-white/35">
    Financial Health
  </span>
</div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Metric
                    label="Cash Received"
                    value={formatMoney(
                      received,
                      currency,
                    )}
                  />

                  <Metric
                    label="Cash Spent"
                    value={formatMoney(
                      spent,
                      currency,
                    )}
                  />

                  <Metric
                    label="Cash Position"
                    value={formatMoney(
                      cashPosition,
                      currency,
                    )}
                    accent={
                      cashPosition >= 0
                    }
                  />

                  <Metric
                    label="Outstanding Commitments"
                    value={formatMoney(
                      outstandingCommitted,
                      currency,
                    )}
                  />

                  <Metric
                    label="After Commitments"
                    value={formatMoney(
                      availableAfterCommitments,
                      currency,
                    )}
                    accent={
                      availableAfterCommitments >= 0
                    }
                  />

                  <Metric
                    label="Player Income"
                    value={formatMoney(
                      playerIncome,
                      currency,
                    )}
                  />

                 <Metric
                   label="Other Income"
                   value={formatMoney(
                     otherIncome,
                     currency,
                   )}
                  />
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-2">
<section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
  <div className="flex items-start justify-between gap-4">
    <div>
      <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
        Expenditure
      </div>

      <h2 className="mt-2 text-xl font-black">
        Recent Expenses
      </h2>
    </div>

    <Link
      href="/staff/finance/expenses"
      className="rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.06em] text-white/50 transition hover:border-[#c7ff2f]/30 hover:text-[#c7ff2f]"
    >
      Expense Ledger
    </Link>
  </div>

            {expenses.length === 0 ? (
              <div className="mt-8 text-sm text-white/35">
                No expenditure recorded yet.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {expenses.slice(0, 5).map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between gap-4 border-b border-white/5 py-3 first:pt-0 last:border-0 last:pb-0"
                  >
                    <div>
                      <div className="font-bold">
                        {expense.description}
                      </div>

                      <div className="mt-1 text-xs text-white/35">
                        {expense.category?.name ||
                          "Uncategorised"}{" "}
                        · {formatStatus(expense.status)}
                      </div>
                    </div>

<div className="flex items-center gap-4">
  <div className="text-right font-black">
    {formatMoney(
      expense.committedAmount ||
        expense.forecastAmount ||
        expense.budgetAmount ||
        0n,
      expense.currency,
    )}
  </div>

  <Link
    href={`/staff/finance/expenses/${expense.id}/edit`}
    className="rounded-full border border-[#c7ff2f]/25 px-4 py-2 text-xs font-black uppercase tracking-[0.06em] text-[#c7ff2f] transition hover:bg-[#c7ff2f] hover:text-black"
  >
    Edit
  </Link>
</div>
 </div>
 ))}

{expenses.length > 5 && (
  <div className="mt-6 border-t border-white/10 pt-5">
    <Link
      href="/staff/finance/expenses"
      className="text-xs font-black uppercase tracking-[0.08em] text-[#c7ff2f] transition hover:text-white"
    >
      View All Expenses →
    </Link>
  </div>
)}

  </div>
    )}
   </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
  <div className="flex items-start justify-between gap-4">
    <div>
      <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
        Income
      </div>

      <h2 className="mt-2 text-xl font-black">
        Other Income
      </h2>
    </div>

    <Link
      href="/staff/finance/income"
      className="rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.06em] text-white/50 transition hover:border-[#c7ff2f]/30 hover:text-[#c7ff2f]"
    >
      Income Ledger
    </Link>
  </div>

{manualIncome.length === 0 ? (
  <div className="mt-8 text-sm text-white/35">
    No sponsorship or other manual income recorded yet.
  </div>
) : (
  <>
    <div className="mt-6 space-y-4">
      {manualIncome.slice(0, 5).map((income) => (
        <div
          key={income.id}
          className="flex items-center justify-between gap-5 border-b border-white/5 pb-4 last:border-0"
        >
          <div>
            <div className="font-bold">
              {income.sourceName}
            </div>

            <div className="mt-1 text-xs text-white/35">
              {income.category?.name ||
                "Uncategorised"}{" "}
              · {formatStatus(income.status)}
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-right">
              <div className="text-xs uppercase tracking-[0.08em] text-white/30">
                Agreed
              </div>

              <div className="mt-1 font-black">
                {formatMoney(
                  income.agreedAmount ??
                    income.expectedAmount ??
                    0n,
                  income.currency,
                )}
              </div>

              <div className="mt-2 text-xs text-white/35">
                Received{" "}
                <span className="font-bold text-white/60">
                  {formatMoney(
                    income.receivedAmount,
                    income.currency,
                  )}
                </span>
              </div>
            </div>

            <Link
              href={`/staff/finance/income/${income.id}/edit`}
              className="rounded-full border border-[#c7ff2f]/25 px-4 py-2 text-xs font-black uppercase tracking-[0.06em] text-[#c7ff2f] transition hover:bg-[#c7ff2f] hover:text-black"
            >
              Edit
            </Link>
          </div>
        </div>
      ))}
    </div>

    {manualIncome.length > 5 && (
      <div className="mt-6 border-t border-white/10 pt-5">
        <Link
          href="/staff/finance/income"
          className="text-xs font-black uppercase tracking-[0.08em] text-[#c7ff2f] transition hover:text-white"
        >
          View All Income →
        </Link>
      </div>
    )}
  </>
)}

          </section>
        </div>
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="text-xs font-black uppercase tracking-[0.08em] text-white/30">
        {label}
      </div>

      <div
        className={`mt-3 text-2xl font-black ${
          accent ? "text-[#c7ff2f]" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function groupAmounts<T>(
  rows: T[],
  currency: (row: T) => string,
  amount: (row: T) => bigint,
) {
  return rows.reduce<Record<string, bigint>>(
    (result, row) => {
      const key = currency(row);

      result[key] =
        (result[key] || 0n) +
        amount(row);

      return result;
    },
    {},
  );
}

function formatMoney(
  amount: bigint | null,
  currency: string | null,
) {
  if (
    amount === null ||
    !currency
  ) {
    return "—";
  }

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

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}
