import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

type CommercialRelationshipPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CommercialRelationshipPage({
  params,
}: CommercialRelationshipPageProps) {
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
      <section className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/staff/commercial"
            className="text-sm text-white/40 transition hover:text-white"
          >
            ← Sponsors & Partners
          </Link>

          <Link
            href={`/staff/commercial/${relationship.id}/edit`}
            className="rounded-full bg-[#c7ff2f] px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-black"
          >
            Edit
          </Link>
        </div>

        <div className="mt-8">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
            Commercial Relationship
          </div>

          <h1 className="mt-3 text-4xl font-black">
            {relationship.organisation.name}
          </h1>

          <div className="mt-3 flex flex-wrap gap-3 text-sm text-white/45">
            <span>
              {formatValue(
                relationship.organisation.type,
              )}
            </span>

            {relationship.organisation.sector && (
              <>
                <span>·</span>

                <span>
                  {relationship.organisation.sector}
                </span>
              </>
            )}

            <span>·</span>

            <span>
              {relationship.event.edition}
            </span>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <Metric
            label="Pipeline Status"
            value={formatValue(
              relationship.status,
            )}
            accent
          />

          <Metric
            label="Contribution"
            value={
              relationship.contributionType
                ? formatValue(
                    relationship.contributionType,
                  )
                : "Not decided"
            }
          />

          <Metric
            label="Package"
            value={
              relationship.packageName || "—"
            }
          />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <Section
            title="Organisation"
            eyebrow="Company"
          >
            <Detail
              label="Organisation name"
              value={
                relationship.organisation.name
              }
            />

            <Detail
              label="Relationship type"
              value={formatValue(
                relationship.organisation.type,
              )}
            />

            <Detail
              label="Sector / Industry"
              value={
                relationship.organisation.sector ||
                "—"
              }
            />

            <Detail
              label="Website"
              value={
                relationship.organisation.website ||
                "—"
              }
            />
          </Section>

          <Section
            title="Primary Contact"
            eyebrow="Contact"
          >
            <Detail
              label="Contact name"
              value={
                relationship.organisation
                  .contactName || "—"
              }
            />

            <Detail
              label="Email"
              value={
                relationship.organisation
                  .contactEmail || "—"
              }
            />

            <Detail
              label="Phone"
              value={
                relationship.organisation
                  .contactPhone || "—"
              }
            />
          </Section>

          <Section
            title="Commercial Opportunity"
            eyebrow="Opportunity"
          >
            <Detail
              label="Pipeline status"
              value={formatValue(
                relationship.status,
              )}
            />

            <Detail
              label="Package / Opportunity"
              value={
                relationship.packageName || "—"
              }
            />

            <Detail
              label="Contribution type"
              value={
                relationship.contributionType
                  ? formatValue(
                      relationship.contributionType,
                    )
                  : "Not decided"
              }
            />

            <Detail
              label="Proposed value"
              value={formatMoney(
                relationship.proposedValue,
                relationship.currency,
              )}
            />

            <Detail
              label="Agreed value"
              value={formatMoney(
                relationship.agreedValue,
                relationship.currency,
              )}
            />

            <Detail
              label="Currency"
              value={
                relationship.currency || "—"
              }
            />
          </Section>

          <Section
            title="Follow-Up"
            eyebrow="Relationship Management"
          >
            <Detail
              label="Next action"
              value={
                relationship.nextAction || "—"
              }
            />

            <Detail
              label="Follow-up date"
              value={formatDate(
                relationship.nextActionDate,
              )}
            />

            <Detail
              label="Website visibility"
              value={
                relationship.showOnWebsite
                  ? "Visible"
                  : "Not visible"
              }
            />
          </Section>
        </div>

        {relationship.inKindDescription && (
          <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
              In-Kind Contribution
            </div>

            <p className="mt-4 whitespace-pre-wrap leading-7 text-white/65">
              {relationship.inKindDescription}
            </p>
          </section>
        )}

        {relationship.notes && (
          <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
              Notes
            </div>

            <p className="mt-4 whitespace-pre-wrap leading-7 text-white/65">
              {relationship.notes}
            </p>
          </section>
        )}
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
      <div className="text-xs font-black uppercase tracking-[0.08em] text-white/30">
        {label}
      </div>

      <div
        className={`mt-3 text-xl font-black ${
          accent
            ? "text-[#c7ff2f]"
            : "text-white"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Section({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
      <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
        {eyebrow}
      </div>

      <h2 className="mt-2 text-xl font-black">
        {title}
      </h2>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.08em] text-white/30">
        {label}
      </div>

      <div className="mt-1 break-words text-sm font-bold text-white/70">
        {value}
      </div>
    </div>
  );
}

function formatValue(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatDate(
  value: Date | null,
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      dateStyle: "medium",
    },
  ).format(value);
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
