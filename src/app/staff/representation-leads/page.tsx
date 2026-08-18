import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";
import { updateRepresentationLead } from "./actions";

type RepresentationLeadsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
};

export default async function RepresentationLeadsPage({
  searchParams,
}: RepresentationLeadsPageProps) {
  await requireStaffUser();

  const params = await searchParams;

  const q = (params.q || "").trim();
  const status = (params.status || "").trim();

  const allowedStatuses = [
    "NOT_ELIGIBLE",
    "POTENTIAL",
    "REVIEW",
    "APPROVED",
    "DECLINED",
    "REPRESENTATION_DISCUSSION",
    "SIGNED",
  ];

  const leads =
    await prisma.registration.findMany({
      where: {
        archivedAt: null,

        representationStatus:
          "UNREPRESENTED_OPEN",

        representationDeclaration: {
          is: {
            interestedInAscendRepresentation:
              true,
          },
        },

        ...(status &&
        allowedStatuses.includes(status)
          ? {
              prospectStatus:
                status as
                  | "NOT_ELIGIBLE"
                  | "POTENTIAL"
                  | "REVIEW"
                  | "APPROVED"
                  | "DECLINED"
                  | "REPRESENTATION_DISCUSSION"
                  | "SIGNED",
            }
          : {}),

        ...(q
          ? {
              OR: [
                {
                  firstName: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
                {
                  lastName: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
                {
                  email: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
                {
                  registrationNumber: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
                {
                  primaryPosition: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      },

      include: {
        event: true,

        representationDeclaration: true,

        videos: {
          where: {
            status: {
              in: [
                "SUBMITTED",
                "PROCESSING",
                "READY",
              ],
            },
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

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
              Representation
            </div>

            <h1 className="mt-3 text-4xl font-black">
              Representation Leads
            </h1>

            <p className="mt-3 max-w-2xl text-white/50">
              Players who have asked ASCEND to
              contact them about football
              representation.
            </p>
          </div>

          <div className="rounded-full border border-[#c7ff2f]/20 bg-[#c7ff2f]/[0.04] px-5 py-3 text-sm">
            <span className="text-white/40">
              Leads
            </span>{" "}
            <span className="font-black text-[#c7ff2f]">
              {leads.length}
            </span>
          </div>
        </div>

        {/* FILTERS */}

        <form className="mt-10 flex flex-wrap gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search player, position or registration"
            className="min-w-[280px] flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#c7ff2f]/60"
          />

          <select
            name="status"
            defaultValue={status}
            className="min-w-[220px] rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm"
          >
            <option value="">
              All pipeline statuses
            </option>

            <option value="POTENTIAL">
              Potential
            </option>

            <option value="REVIEW">
              Review
            </option>

            <option value="APPROVED">
              Approved
            </option>

            <option value="REPRESENTATION_DISCUSSION">
              Representation Discussion
            </option>

            <option value="SIGNED">
              Signed
            </option>

            <option value="DECLINED">
              Declined
            </option>

            <option value="NOT_ELIGIBLE">
              Not Eligible
            </option>
          </select>

          <button
            type="submit"
            className="rounded-full bg-[#c7ff2f] px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-black"
          >
            Apply
          </button>

          <Link
            href="/staff/representation-leads"
            className="rounded-full border border-white/10 px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-white/50"
          >
            Clear
          </Link>
        </form>

        {/* LEADS */}

        <div className="mt-8 space-y-4">
          {leads.map((lead) => {
            const age = getAgeAtDate(
              lead.dateOfBirth,
              lead.event.footballStartsAt,
            );

            return (
              <section
                key={lead.id}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
              >
                <div className="grid gap-6 xl:grid-cols-[1.3fr_0.8fr_0.8fr_1.5fr_auto] xl:items-start">
                  {/* PLAYER */}

                  <div>
                    <Link
                      href={`/staff/registrations/${lead.id}`}
                      className="text-lg font-black transition hover:text-[#c7ff2f]"
                    >
                      {lead.firstName || "—"}{" "}
                      {lead.lastName || ""}
                    </Link>

                    <div className="mt-1 text-sm text-white/45">
                      {lead.primaryPosition ||
                        "Position not recorded"}
                      {age !== null
                        ? ` · ${age} years`
                        : ""}
                    </div>

                    <div className="mt-2 font-mono text-xs text-white/30">
                      {lead.registrationNumber ||
                        "Registration pending"}
                    </div>
                  </div>

                  {/* FOOTBALL */}

                  <div>
                    <Label>
                      Current Club
                    </Label>

                    <Value>
                      {lead.currentClub ||
                        lead.academyName ||
                        "—"}
                    </Value>
                  </div>

                  {/* VIDEO */}

                  <div>
                    <Label>
                      Video
                    </Label>

                    <Value
                      accent={
                        lead.videos.length > 0
                      }
                    >
                      {lead.videos.length > 0
                        ? "Submitted"
                        : "Missing"}
                    </Value>
                  </div>

                  {/* PIPELINE */}

                  <form
                    action={
                      updateRepresentationLead
                    }
                  >
                    <input
                      type="hidden"
                      name="registrationId"
                      value={lead.id}
                    />

                    <Label>
                      Representation Pipeline
                    </Label>

                    <select
                      name="prospectStatus"
                      defaultValue={
                        lead.prospectStatus
                      }
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm"
                    >
                      <option value="POTENTIAL">
                        Potential
                      </option>

                      <option value="REVIEW">
                        Review
                      </option>

                      <option value="APPROVED">
                        Approved
                      </option>

                      <option value="REPRESENTATION_DISCUSSION">
                        Representation Discussion
                      </option>

                      <option value="SIGNED">
                        Signed
                      </option>

                      <option value="DECLINED">
                        Declined
                      </option>

                      <option value="NOT_ELIGIBLE">
                        Not Eligible
                      </option>
                    </select>

                    <textarea
                      name="notes"
                      defaultValue={
                        lead
                          .representationDeclaration
                          ?.notes || ""
                      }
                      placeholder="Internal representation notes..."
                      rows={2}
                      className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#c7ff2f]/50"
                    />

                    <button
                      type="submit"
                      className="mt-3 rounded-full border border-[#c7ff2f]/30 px-5 py-2 text-xs font-black uppercase tracking-[0.06em] text-[#c7ff2f] transition hover:bg-[#c7ff2f]/10"
                    >
                      Save
                    </button>
                  </form>

                  {/* VIEW */}

                  <Link
                    href={`/staff/registrations/${lead.id}`}
                    className="rounded-full border border-white/10 px-5 py-2.5 text-center text-xs font-black uppercase tracking-[0.06em] text-white/60 transition hover:border-[#c7ff2f]/30 hover:text-[#c7ff2f]"
                  >
                    View
                  </Link>
                </div>
              </section>
            );
          })}

          {leads.length === 0 && (
            <div className="rounded-2xl border border-white/10 px-6 py-16 text-center text-white/35">
              No representation leads match
              these filters.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function Label({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="text-xs font-black uppercase tracking-[0.08em] text-white/35">
      {children}
    </div>
  );
}

function Value({
  children,
  accent = false,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`mt-2 text-sm font-bold ${
        accent
          ? "text-[#c7ff2f]"
          : "text-white/70"
      }`}
    >
      {children}
    </div>
  );
}

function getAgeAtDate(
  dateOfBirth: Date | null,
  eventDate: Date | null,
) {
  if (!dateOfBirth || !eventDate) {
    return null;
  }

  let age =
    eventDate.getFullYear() -
    dateOfBirth.getFullYear();

  const monthDifference =
    eventDate.getMonth() -
    dateOfBirth.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      eventDate.getDate() <
        dateOfBirth.getDate())
  ) {
    age -= 1;
  }

  return age;
}
