import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

import { createCommercialRelationship } from "./actions";

export default async function NewCommercialOrganisationPage() {
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

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <section className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
        <Link
          href="/staff/commercial"
          className="text-sm text-white/40 transition hover:text-white"
        >
          ← Sponsors & Partners
        </Link>

        <div className="mt-6">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
            Commercial
          </div>

          <h1 className="mt-3 text-4xl font-black">
            Add Organisation
          </h1>

          <p className="mt-3 max-w-2xl text-white/50">
            Add a sponsor, commercial partner or supplier to the{" "}
            {activeEvent.edition} pipeline.
          </p>
        </div>

        <form
          action={createCommercialRelationship}
          className="mt-10 space-y-8"
        >
          <input
            type="hidden"
            name="eventId"
            value={activeEvent.id}
          />

          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
              Organisation
            </div>

            <h2 className="mt-2 text-xl font-black">
              Company Details
            </h2>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <Field
                label="Organisation name"
                name="name"
                required
              />

              <label className="space-y-2">
                <span className="text-sm font-semibold">
                  Relationship type
                </span>

                <select
                  name="type"
                  required
                  defaultValue="SPONSOR"
                  className={inputClass}
                >
                  <option value="SPONSOR">Sponsor</option>
                  <option value="PARTNER">Partner</option>
                  <option value="SUPPLIER">Supplier</option>
                </select>
              </label>

              <Field
                label="Sector / Industry"
                name="sector"
                placeholder="e.g. Banking, Airline, Technology"
              />

              <Field
                label="Website"
                name="website"
                type="url"
                placeholder="https://..."
              />
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
              Contact
            </div>

            <h2 className="mt-2 text-xl font-black">
              Primary Contact
            </h2>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <Field
                label="Contact name"
                name="contactName"
              />

              <Field
                label="Email"
                name="contactEmail"
                type="email"
              />

              <Field
                label="Phone"
                name="contactPhone"
                type="tel"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
              Opportunity
            </div>

            <h2 className="mt-2 text-xl font-black">
              Commercial Relationship
            </h2>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold">
                  Pipeline status
                </span>

                <select
                  name="status"
                  defaultValue="PROSPECT"
                  className={inputClass}
                >
                  <option value="PROSPECT">Prospect</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="DISCUSSION">In Discussion</option>
                  <option value="PROPOSAL_SENT">Proposal Sent</option>
                  <option value="NEGOTIATION">Negotiation</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="ACTIVATED">Activated</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="DECLINED">Declined</option>
                </select>
              </label>

              <Field
                label="Package / Opportunity"
                name="packageName"
                placeholder="e.g. Headline Sponsor"
              />

             <label className="space-y-2">
  <span className="text-sm font-semibold">
    Contribution type
  </span>

  <select
    name="contributionType"
    defaultValue=""
    className={inputClass}
  >
    <option value="">Not decided</option>
    <option value="CASH">Cash</option>
    <option value="IN_KIND">In-kind</option>
    <option value="CASH_AND_IN_KIND">
      Cash + In-kind
    </option>
  </select>
</label>

              <Field
                label="Proposed value"
                name="proposedValue"
                type="number"
                min="0"
                placeholder="5000000"
              />

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
                label="Next action"
                name="nextAction"
                placeholder="e.g. Send sponsorship proposal"
              />

              <Field
                label="Follow-up date"
                name="nextActionDate"
                type="date"
              />
            </div>

<label className="mt-6 block space-y-2">
  <span className="text-sm font-semibold">
    In-kind contribution
  </span>

  <textarea
    name="inKindDescription"
    rows={3}
    className={inputClass}
    placeholder="e.g. Player kits, staff kits, footballs, hotel rooms, flights, transport or event services..."
  />
</label>

            <label className="mt-6 block space-y-2">
              <span className="text-sm font-semibold">
                Notes
              </span>

              <textarea
                name="notes"
                rows={5}
                className={inputClass}
                placeholder="Commercial notes, conversation history, requirements..."
              />
            </label>
          </section>

          <div className="flex justify-end gap-3">
            <Link
              href="/staff/commercial"
              className="rounded-full border border-white/10 px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-white/50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="rounded-full bg-[#c7ff2f] px-7 py-3 text-xs font-black uppercase tracking-[0.08em] text-black"
            >
              Add to Pipeline
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
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  min?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold">{label}</span>

      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        min={min}
        className={inputClass}
      />
    </label>
  );
}
