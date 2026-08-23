import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

import { updateFinanceExpense, cancelFinanceExpense } from "./actions";

type EditExpensePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditExpensePage({
  params,
}: EditExpensePageProps) {
  await requireStaffUser();

  const { id } = await params;

  const expense = await prisma.financeExpense.findUnique({
    where: { id },

    include: {
      category: true,
      event: true,
    },
  });

  if (!expense) {
    notFound();
  }

  const categories = await prisma.financeCategory.findMany({
    where: {
      eventId: expense.eventId,
      type: "EXPENSE",
    },
    orderBy: [
      { sortOrder: "asc" },
      { name: "asc" },
    ],
  });

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <section className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
        <Link
          href="/staff/finance"
          className="text-sm text-white/40 transition hover:text-white"
        >
          ← Financial Health
        </Link>

        <div className="mt-6">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
            Finance
          </div>

          <h1 className="mt-3 text-4xl font-black">
            Edit Expense
          </h1>

          <p className="mt-3 max-w-2xl text-white/50">
            Update expenditure for {expense.event.edition}.
          </p>
        </div>

        <form
          action={updateFinanceExpense}
          className="mt-10 space-y-8"
        >
          <input
            type="hidden"
            name="expenseId"
            value={expense.id}
          />

          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
              Expense
            </div>

            <h2 className="mt-2 text-xl font-black">
              Expense Details
            </h2>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold">
                  Category
                </span>

                <select
                  name="categoryId"
                  defaultValue={expense.categoryId ?? ""}
                  className={inputClass}
                >
                  <option value="">Uncategorised</option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <Field
                label="Supplier / Payee"
                name="supplierName"
                defaultValue={expense.supplierName ?? ""}
              />

              <Field
                label="Description"
                name="description"
                required
                defaultValue={expense.description}
              />

              <label className="space-y-2">
                <span className="text-sm font-semibold">
                  Status
                </span>

                <select
                  name="status"
                  defaultValue={expense.status}
                  className={inputClass}
                >
                  <option value="PLANNED">Planned</option>
                  <option value="QUOTED">Quoted</option>
                  <option value="APPROVED">Approved</option>
                  <option value="COMMITTED">Committed</option>
                  <option value="PART_PAID">Part Paid</option>
                  <option value="PAID">Paid</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold">
                  Currency
                </span>

                <select
                  name="currency"
                  defaultValue={expense.currency}
                  className={inputClass}
                >
                  <option value="NGN">NGN</option>
                  <option value="GBP">GBP</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </label>

              <Field
                label="Due date"
                name="dueDate"
                type="date"
                defaultValue={
                  expense.dueDate
                    ? expense.dueDate.toISOString().slice(0, 10)
                    : ""
                }
              />
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
              Financial Position
            </div>

            <h2 className="mt-2 text-xl font-black">
              Budget & Actuals
            </h2>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <Field
                label="Budget amount"
                name="budgetAmount"
                type="number"
                min="0"
                step="0.01"
                defaultValue={moneyInput(expense.budgetAmount)}
              />

              <Field
                label="Forecast amount"
                name="forecastAmount"
                type="number"
                min="0"
                step="0.01"
                defaultValue={moneyInput(expense.forecastAmount)}
              />

              <Field
                label="Committed amount"
                name="committedAmount"
                type="number"
                min="0"
                step="0.01"
                defaultValue={moneyInput(expense.committedAmount)}
              />

              <Field
                label="Paid amount"
                name="paidAmount"
                type="number"
                min="0"
                step="0.01"
                defaultValue={moneyInput(expense.paidAmount)}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
              References
            </div>

            <h2 className="mt-2 text-xl font-black">
              Payment & Notes
            </h2>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <Field
                label="Invoice reference"
                name="invoiceReference"
                defaultValue={expense.invoiceReference ?? ""}
              />

              <Field
                label="Payment reference"
                name="paymentReference"
                defaultValue={expense.paymentReference ?? ""}
              />

              <Field
                label="Paid date"
                name="paidAt"
                type="date"
                defaultValue={
                  expense.paidAt
                    ? expense.paidAt.toISOString().slice(0, 10)
                    : ""
                }
              />
            </div>

            <label className="mt-6 block space-y-2">
              <span className="text-sm font-semibold">
                Notes
              </span>

              <textarea
                name="notes"
                rows={5}
                defaultValue={expense.notes ?? ""}
                className={inputClass}
              />
            </label>
          </section>

          <div className="flex justify-end gap-3">
            <Link
              href="/staff/finance"
              className="rounded-full border border-white/10 px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-white/50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="rounded-full bg-[#c7ff2f] px-7 py-3 text-xs font-black uppercase tracking-[0.08em] text-black"
            >
              Save Changes
            </button>
          </div>
        </form>
  
        <section className="mt-10 rounded-2xl border border-red-400/15 bg-red-400/[0.025] p-6">
  <div className="text-xs font-black uppercase tracking-[0.12em] text-red-300">
    Archive Expense Record
  </div>

  <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">
    Archive this expense record and remove it from Financial Health.
    The record will remain available in the Expense Ledger for audit history.
  </p>

  <form
    action={cancelFinanceExpense}
    className="mt-5"
  >
    <input
      type="hidden"
      name="expenseId"
      value={expense.id}
    />

    <button
      type="submit"
      className="rounded-full border border-red-400/30 px-5 py-3 text-xs font-black uppercase tracking-[0.08em] text-red-300 transition hover:bg-red-400/10"
    >
      Archive Expense
    </button>
  </form>
</section> 

      </section>
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm outline-none transition placeholder:text-white/20 focus:border-[#c7ff2f]/50";

function Field({
  label,
  name,
  type = "text",
  required = false,
  defaultValue = "",
  min,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  min?: string;
  step?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold">
        {label}
      </span>

      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        min={min}
        step={step}
        className={inputClass}
      />
    </label>
  );
}

function moneyInput(
  value: bigint | null,
) {
  if (value === null) {
    return "";
  }

  return String(Number(value) / 100);
}
