import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

export default async function CommercialPage() {
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

  const relationships =
    await prisma.commercialRelationship.findMany({
      where: {
        eventId: activeEvent.id,
      },

      include: {
        organisation: true,
      },

      orderBy: [
        {
          status: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

  const confirmed = relationships.filter(
    (item) =>
      item.status === "CONFIRMED" ||
      item.status === "ACTIVATED" ||
      item.status === "COMPLETED",
  );

  const pipeline = relationships.filter(
    (item) =>
      ![
        "CONFIRMED",
        "ACTIVATED",
        "COMPLETED",
        "DECLINED",
      ].includes(item.status),
  );

  const followUpsDue = relationships.filter(
    (item) =>
      item.nextActionDate &&
      item.nextActionDate <= new Date() &&
      item.status !== "COMPLETED" &&
      item.status !== "DECLINED",
  );

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
              Commercial
            </div>

            <h1 className="mt-3 text-4xl font-black">
              Sponsors & Partners
            </h1>

            <p className="mt-3 max-w-2xl text-white/50">
              Manage sponsorship prospects, commercial partners,
              suppliers and event relationships for {activeEvent.edition}.
            </p>
          </div>

          <Link
            href="/staff/commercial/new"
            className="rounded-full bg-[#c7ff2f] px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-black"
          >
            Add Organisation
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            label="Pipeline"
            value={pipeline.length}
          />

          <Metric
            label="Confirmed"
            value={confirmed.length}
            accent
          />

          <Metric
            label="Follow-Ups Due"
            value={followUpsDue.length}
          />

          <Metric
            label="Total Relationships"
            value={relationships.length}
          />
        </div>

        <section className="mt-10 overflow-hidden rounded-2xl border border-white/10">
          <div className="border-b border-white/10 bg-white/[0.03] px-6 py-5">
            <h2 className="text-xl font-black">
              Commercial Pipeline
            </h2>
          </div>

          {relationships.length === 0 ? (
            <div className="px-6 py-16 text-center text-white/35">
              No sponsors, partners or suppliers have been added yet.
            </div>
          ) : (
            <div>
              {relationships.map((relationship) => (
                <div
                  key={relationship.id}
                  className="grid gap-5 border-b border-white/5 px-6 py-5 last:border-b-0 lg:grid-cols-[1.4fr_0.7fr_0.9fr_1fr_1fr_auto] lg:items-center"
                >
                  <div>
                    <div className="font-black">
                      {relationship.organisation.name}
                    </div>

                    <div className="mt-1 text-sm text-white/40">
                      {formatOrganisationType(
                        relationship.organisation.type,
                      )}
                      {relationship.organisation.sector
                        ? ` · ${relationship.organisation.sector}`
                        : ""}
                    </div>
                  </div>

                  <Info
                    label="Status"
                    value={formatStatus(
                      relationship.status,
                    )}
                  />

                  <Info
                    label="Package"
                    value={
                      relationship.packageName || "—"
                    }
                  />

                  <Info
                    label="Contact"
                    value={
                      relationship.organisation
                        .contactName || "—"
                    }
                  />

                  <Info
                    label="Next Action"
                    value={
                      relationship.nextAction || "—"
                    }
                  />

<div className="flex items-center gap-2">
  <Link
    href={`/staff/commercial/${relationship.id}`}
    className="rounded-full border border-white/10 px-4 py-2 text-center text-xs font-black uppercase tracking-[0.06em] text-white/60 transition hover:border-[#c7ff2f]/30 hover:text-[#c7ff2f]"
  >
    View
  </Link>

  <Link
    href={`/staff/commercial/${relationship.id}/edit`}
    className="rounded-full border border-[#c7ff2f]/25 px-4 py-2 text-center text-xs font-black uppercase tracking-[0.06em] text-[#c7ff2f] transition hover:bg-[#c7ff2f] hover:text-black"
  >
    Edit
  </Link>
</div>
                </div>
              ))}
            </div>
          )}
        </section>
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
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
      <div className="text-xs font-black uppercase tracking-[0.08em] text-white/35">
        {label}
      </div>

      <div
        className={`mt-3 text-4xl font-black ${
          accent ? "text-[#c7ff2f]" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Info({
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

      <div className="mt-1 text-sm font-bold text-white/70">
        {value}
      </div>
    </div>
  );
}

function formatOrganisationType(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}
