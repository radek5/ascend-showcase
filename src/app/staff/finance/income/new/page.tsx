import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

import { createFinanceIncome } from "./actions";

export default async function NewFinanceIncomePage() {
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
      type: "INCOME",
    },
    orderBy: [
      { sortOrder: "asc" },
      { name: "asc" },
    ],
  });

  const commercialRelationships =
    await prisma.commercialRelationship.findMany({
      where: {
        eventId: activeEvent.id,
        status: {
          not: "DECLINED",
        },
      },
      include: {
        organisation: true,
      },
      orderBy: {
        organisation: {
          name: "asc",
        },
      },
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
            Add Income
          </h1>

          <p className="mt-3 max-w-2xl text-white/50">
            Record sponsorship, grants and other non-player income for{" "}
            {activeEvent.edition}.
          </p>
        </div>

        <form
          action={createFinanceIncome}
          className="mt-10 space-y-8"
        >
          <input
            type="hidden"
            name="eventId"
            value={activeEvent.id}
          />

          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
              Income
            </div>

            <h2 className="mt-2 text-xl font-black">
              Income Details
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
                label="Source name"
                name="sourceName"
                required
                placeholder="e.g. Adidas"
              />

              <label className="space-y-2">
                <span className="text-sm font-semibold">
                  Linked commercial relationship
                </span>

                <select
                  name="commercialRelationshipId"
                  defaultValue=""
                  className={inputClass}
                >
                  <option value="">
                    None
                  </option>

                  {commercialRelationships.map((relationship) => (
                    <option
                      key={relationship.id}
                      value={relationship.id}
                    >
                      {relationship.organisation.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold">
                  Status
                </span>

                <select
                  name="status"
                  defaultValue="EXPECTED"
                  className={inputClass}
                >
                  <option value="EXPECTED">Expected</option>
                  <option value="AGREED">Agreed</option>
                  <option value="INVOICED">Invoiced</option>
                  <option value="PART_RECEIVED">
                    Part Received
                  </option>
                  <option value="RECEIVED">Received</option>
                  <option value="CANCELLED">Cancelled</option>
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

            <label className="mt-6 block space-y-2">
              <span className="text-sm font-semibold">
                Description
              </span>

              <textarea
                name="description"
                rows={3}
                className={inputClass}
                placeholder="e.g. Lagos 2027 Official Kit & Equipment partnership"
              />
            </label>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
              Financial Position
            </div>

            <h2 className="mt-2 text-xl font-black">
              Expected & Received
            </h2>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <Field
                label="Expected amount"
                name="expectedAmount"
                type="number"
                min="0"
                step="0.01"
              />

              <Field
                label="Agreed amount"
                name="agreedAmount"
                type="number"
                min="0"
                step="0.01"
              />

              <Field
                label="Invoiced amount"
                name="invoicedAmount"
                type="number"
                min="0"
                step="0.01"
              />

              <Field
                label="Received amount"
                name="receivedAmount"
                type="number"
                min="0"
                step="0.01"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
              References
            </div>

            <h2 className="mt-2 text-xl font-black">
              Invoice & Notes
            </h2>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <Field
                label="Invoice reference"
                name="invoiceReference"
              />

              <Field
                label="Payment reference"
                name="paymentReference"
              />

              <Field
                label="Received date"
                name="receivedAt"
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
              Add Income
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
