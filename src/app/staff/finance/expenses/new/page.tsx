import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

import { createFinanceExpense } from "./actions";

export default async function NewFinanceExpensePage() {
  await requireStaffUser();

  const activeEvent = await prisma.event.findFirst({
    where: {
      active: true,
    },
  });

  if (!activeEvent) {
    return (
      <main className="min-h-screen bg-[#090909] text-white">
        <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
          No active ASCEND event is configured.
        </div>
      </main>
    );
  }

  const categories = await prisma.financeCategory.findMany({
    where: {
      eventId: activeEvent.id,
      type: "EXPENSE",
    },
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        name: "asc",
      },
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
            Add Expense
          </h1>

          <p className="mt-3 max-w-2xl text-white/50">
            Record planned, forecast, committed and paid expenditure for{" "}
            {activeEvent.edition}.
          </p>
        </div>

        <form
          action={createFinanceExpense}
          className="mt-10 space-y-8"
        >
          <input
            type="hidden"
            name="eventId"
            value={activeEvent.id}
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
                  defaultValue=""
                  className={inputClass}
                >
                  <option value="">
                    Uncategorised
                  </option>

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
                placeholder="e.g. Lagos venue operator"
              />

              <Field
                label="Description"
                name="description"
                required
                placeholder="e.g. Main venue hire"
              />

              <label className="space-y-2">
                <span className="text-sm font-semibold">
                  Status
                </span>

                <select
                  name="status"
                  defaultValue="PLANNED"
                  className={inputClass}
                >
                  <option value="PLANNED">
                    Planned
                  </option>
                  <option value="QUOTED">
                    Quoted
                  </option>
                  <option value="APPROVED">
                    Approved
                  </option>
                  <option value="COMMITTED">
                    Committed
                  </option>
                  <option value="PART_PAID">
                    Part Paid
                  </option>
                  <option value="PAID">
                    Paid
                  </option>
                  <option value="CANCELLED">
                    Cancelled
                  </option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold">
                  Currency
                </span>

                <select
                  name="currency"
                  defaultValue="NGN"
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

            <p className="mt-2 text-sm leading-6 text-white/45">
              Enter normal currency amounts. ASCEND stores them internally in
              minor currency units.
            </p>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <Field
                label="Budget amount"
                name="budgetAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="8000000"
              />

              <Field
                label="Forecast amount"
                name="forecastAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="7500000"
              />

              <Field
                label="Committed amount"
                name="committedAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="7500000"
              />

              <Field
                label="Paid amount"
                name="paidAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="2500000"
              />
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/45">
              Example: Venue budget ₦8m, latest forecast ₦7.5m, contract
              committed at ₦7.5m, deposit paid ₦2.5m.
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
                placeholder="e.g. VENUE-001"
              />

              <Field
                label="Payment reference"
                name="paymentReference"
              />

              <Field
                label="Paid date"
                name="paidAt"
                type="date"
              />
            </div>

            <label className="mt-6 block space-y-2">
              <span className="text-sm font-semibold">
                Notes
              </span>

              <textarea
                name="notes"
                rows={5}
                className={inputClass}
                placeholder="Contract terms, payment schedule, VAT/tax notes, approvals..."
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
              Add Expense
            </button>
          </div>
        </form>
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
  placeholder,
  min,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
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
        placeholder={placeholder}
        min={min}
        step={step}
        className={inputClass}
      />
    </label>
  );
}
