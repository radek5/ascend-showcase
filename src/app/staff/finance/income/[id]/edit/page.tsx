import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

import { updateFinanceIncome, cancelFinanceIncome } from "./actions";

type EditIncomePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditIncomePage({
  params,
}: EditIncomePageProps) {
  await requireStaffUser();

  const { id } = await params;

  const income = await prisma.financeIncome.findUnique({
    where: {
      id,
    },
    include: {
      event: true,
      category: true,
      commercialRelationship: {
        include: {
          organisation: true,
        },
      },
    },
  });

  if (!income) {
    notFound();
  }

  const categories = await prisma.financeCategory.findMany({
    where: {
      eventId: income.eventId,
      type: "INCOME",
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

  const commercialRelationships =
    await prisma.commercialRelationship.findMany({
      where: {
        eventId: income.eventId,
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
            Edit Income
          </h1>

          <p className="mt-3 max-w-2xl text-white/50">
            Update income details for {income.event.edition}.
          </p>
        </div>

        <form
          action={updateFinanceIncome}
          className="mt-10 space-y-8"
        >
          <input
            type="hidden"
            name="incomeId"
            value={income.id}
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
                  defaultValue={income.categoryId ?? ""}
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
                defaultValue={income.sourceName}
              />

              <label className="space-y-2">
                <span className="text-sm font-semibold">
                  Linked commercial relationship
                </span>

                <select
                  name="commercialRelationshipId"
                  defaultValue={
                    income.commercialRelationshipId ?? ""
                  }
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
                  defaultValue={income.status}
                  className={inputClass}
                >
                  <option value="EXPECTED">
                    Expected
                  </option>
                  <option value="AGREED">
                    Agreed
                  </option>
                  <option value="INVOICED">
                    Invoiced
                  </option>
                  <option value="PART_RECEIVED">
                    Part Received
                  </option>
                  <option value="RECEIVED">
                    Received
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
                  defaultValue={income.currency}
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
                  income.dueDate
                    ? income.dueDate.toISOString().slice(0, 10)
                    : ""
                }
              />
            </div>

            <label className="mt-6 block space-y-2">
              <span className="text-sm font-semibold">
                Description
              </span>

              <textarea
                name="description"
                rows={3}
                defaultValue={income.description ?? ""}
                className={inputClass}
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
                defaultValue={moneyInput(
                  income.expectedAmount,
                )}
              />

              <Field
                label="Agreed amount"
                name="agreedAmount"
                type="number"
                min="0"
                step="0.01"
                defaultValue={moneyInput(
                  income.agreedAmount,
                )}
              />

              <Field
                label="Invoiced amount"
                name="invoicedAmount"
                type="number"
                min="0"
                step="0.01"
                defaultValue={moneyInput(
                  income.invoicedAmount,
                )}
              />

              <Field
                label="Received amount"
                name="receivedAmount"
                type="number"
                min="0"
                step="0.01"
                defaultValue={moneyInput(
                  income.receivedAmount,
                )}
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
                defaultValue={
                  income.invoiceReference ?? ""
                }
              />

              <Field
                label="Payment reference"
                name="paymentReference"
                defaultValue={
                  income.paymentReference ?? ""
                }
              />

              <Field
                label="Received date"
                name="receivedAt"
                type="date"
                defaultValue={
                  income.receivedAt
                    ? income.receivedAt
                        .toISOString()
                        .slice(0, 10)
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
                defaultValue={income.notes ?? ""}
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
            Archive Income Record
         </div>

         <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">
           Archive this income record and remove it from Financial Health.
           The record will remain avaiable in the Income Ledger for audit history.
         </p>

         <form
            action={cancelFinanceIncome}
            className="mt-5"
         >
            <input
               type="hidden"
               name="incomeId"
               value={income.id}
         />

         <button
            type="submit"
            className="rounded-full border border-red-400/30 px-5 py-3 text-xs font-black uppercase tracking-[0.08em] text-red-300 transition hover:bg-red-400/10"
         >
            Archive Income
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
