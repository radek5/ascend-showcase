import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

import { updateCommercialRelationship } from "./actions";

type EditCommercialPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCommercialPage({
  params,
}: EditCommercialPageProps) {
  await requireStaffUser();

  const { id } = await params;

  const relationship =
    await prisma.commercialRelationship.findUnique({
      where: {
        id,
      },
      include: {
        organisation: true,
        event: true,
      },
    });

  if (!relationship) {
    notFound();
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
            Edit Organisation
          </h1>

          <p className="mt-3 max-w-2xl text-white/50">
            Update organisation, contact and commercial relationship details for{" "}
            {relationship.event.edition}.
          </p>
        </div>

        <form
          action={updateCommercialRelationship}
          className="mt-10 space-y-8"
        >
          <input
            type="hidden"
            name="relationshipId"
            value={relationship.id}
          />

          <input
            type="hidden"
            name="organisationId"
            value={relationship.organisation.id}
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
                defaultValue={relationship.organisation.name}
                required
              />

              <label className="space-y-2">
                <span className="text-sm font-semibold">
                  Relationship type
                </span>

                <select
                  name="type"
                  defaultValue={relationship.organisation.type}
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
                defaultValue={relationship.organisation.sector ?? ""}
              />

              <Field
                label="Website"
                name="website"
                type="url"
                defaultValue={relationship.organisation.website ?? ""}
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
                defaultValue={relationship.organisation.contactName ?? ""}
              />

              <Field
                label="Email"
                name="contactEmail"
                type="email"
                defaultValue={relationship.organisation.contactEmail ?? ""}
              />

              <Field
                label="Phone"
                name="contactPhone"
                type="tel"
                defaultValue={relationship.organisation.contactPhone ?? ""}
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
                  defaultValue={relationship.status}
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
                defaultValue={relationship.packageName ?? ""}
              />

<label className="space-y-2">
  <span className="text-sm font-semibold">
    Contribution type
  </span>

  <select
    name="contributionType"
    defaultValue={relationship.contributionType ?? ""}
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
                defaultValue={
                  relationship.proposedValue !== null
                    ? String(Number(relationship.proposedValue) / 100)
                    : ""
                }
              />

              <Field
                label="Agreed value"
                name="agreedValue"
                type="number"
                min="0"
                defaultValue={
                  relationship.agreedValue !== null
                    ? String(Number(relationship.agreedValue) / 100)
                    : ""
                }
              />

              <label className="space-y-2">
                <span className="text-sm font-semibold">
                  Currency
                </span>

                <select
                  name="currency"
                  defaultValue={relationship.currency ?? "NGN"}
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
                defaultValue={relationship.nextAction ?? ""}
              />

              <Field
                label="Follow-up date"
                name="nextActionDate"
                type="date"
                defaultValue={
                  relationship.nextActionDate
                    ? relationship.nextActionDate
                        .toISOString()
                        .slice(0, 10)
                    : ""
                }
              />
            </div>

<label className="mt-6 block space-y-2">
  <span className="text-sm font-semibold">
    In-kind contribution
  </span>

  <textarea
    name="inKindDescription"
    rows={3}
    defaultValue={relationship.inKindDescription ?? ""}
    className={inputClass}
    placeholder="Describe any products, services, facilities or other non-cash contribution..."
  />
</label>

            <label className="mt-6 block space-y-2">
              <span className="text-sm font-semibold">
                Notes
              </span>

              <textarea
                name="notes"
                rows={6}
                defaultValue={relationship.notes ?? ""}
                className={inputClass}
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
              Save Changes
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
  defaultValue = "",
  min,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  min?: string;
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
        className={inputClass}
      />
    </label>
  );
}
