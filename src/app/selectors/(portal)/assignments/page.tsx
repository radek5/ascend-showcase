import Link from "next/link";

import RevelationX1Logo from "@/components/brand/RevelationX1Logo";
import { prisma } from "@/lib/prisma";
import { requireSelector } from "@/lib/selectors/auth";

export default async function SelectorAssignmentsPage() {
  const selector = await requireSelector();

  const assignments = await prisma.selectorAssignment.findMany({
    where: {
      selectorId: selector.id,
      status: {
        not: "CANCELLED",
      },
    },
    select: {
      id: true,
      round: true,
      status: true,
      assignedAt: true,
      startedAt: true,
      completedAt: true,
      application: {
        select: {
          assessmentCode: true,
          position: true,
          secondaryPosition: true,
          preferredFoot: true,
          videos: {
            where: {
              status: {
                in: ["SUBMITTED", "PROCESSING", "READY"],
              },
            },
            select: {
              id: true,
            },
          },
        },
      },
      assessment: {
        select: {
          recommendation: true,
          submittedAt: true,
        },
      },
    },
    orderBy: [
      {
        completedAt: "asc",
      },
      {
        assignedAt: "asc",
      },
    ],
  });

  const openCount = assignments.filter(
    (assignment) =>
      assignment.status === "ASSIGNED" || assignment.status === "IN_REVIEW",
  ).length;

  const completedCount = assignments.filter(
    (assignment) => assignment.status === "COMPLETED",
  ).length;

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10 bg-[#0b0b0b]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <RevelationX1Logo />

          <div className="text-right">
            <div className="text-sm font-bold">{selector.name}</div>
            <div className="text-xs uppercase tracking-[0.1em] text-white/35">
              Selector
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <Link
          href="/selectors"
          className="text-xs font-black uppercase tracking-[0.12em] text-white/40 transition hover:text-white"
        >
          ← Selector Portal
        </Link>

        <div className="mt-8">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
            Lagos 2026
          </div>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Assessment Queue
          </h1>

          <p className="mt-4 max-w-2xl text-white/50">
            Review your assigned anonymous player evidence and submit structured
            football assessments.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Metric label="Total Assignments" value={assignments.length} />
          <Metric label="Open" value={openCount} />
          <Metric label="Completed" value={completedCount} />
        </div>

        <div className="mt-10 space-y-4">
          {assignments.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-8">
              <div className="text-lg font-black">No assignments yet</div>
              <p className="mt-2 text-sm leading-6 text-white/45">
                New player assessments assigned to you will appear here.
              </p>
            </div>
          ) : (
            assignments.map((assignment) => {
              const code =
                assignment.application.assessmentCode || "Assessment pending";

              const completed = assignment.status === "COMPLETED";

              return (
                <div
                  key={assignment.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.025] p-6"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-xl font-black">{code}</div>

                        <StatusBadge status={assignment.status} />

                        <div className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-white/40">
                          Round {assignment.round}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/45">
                        <span>
                          Position:{" "}
                          <strong className="text-white/70">
                            {assignment.application.position || "—"}
                          </strong>
                        </span>

                        <span>
                          Preferred foot:{" "}
                          <strong className="text-white/70">
                            {assignment.application.preferredFoot || "—"}
                          </strong>
                        </span>

                        <span>
                          Evidence:{" "}
                          <strong className="text-white/70">
                            {assignment.application.videos.length} video
                            {assignment.application.videos.length === 1
                              ? ""
                              : "s"}
                          </strong>
                        </span>
                      </div>

                      {completed && assignment.assessment?.recommendation ? (
                        <div className="mt-3 text-xs font-bold uppercase tracking-[0.08em] text-[#c7ff2f]">
                          Recommendation:{" "}
                          {formatRecommendation(
                            assignment.assessment.recommendation,
                          )}
                        </div>
                      ) : null}
                    </div>

                    <Link
                      href={`/selectors/assignments/${assignment.id}`}
                      className="rounded-full border border-[#c7ff2f]/35 px-6 py-3 text-center text-xs font-black uppercase tracking-[0.08em] text-[#c7ff2f]"
                    >
                      {completed ? "View Assessment" : "Assess Player"}
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm leading-6 text-white/45">
          Assessments are intentionally anonymous. Player identity, contact,
          representation and commercial information are excluded from this
          workspace.
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
      <div className="text-xs font-black uppercase tracking-[0.12em] text-white/35">
        {label}
      </div>
      <div className="mt-3 text-4xl font-black">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label =
    status === "ASSIGNED"
      ? "Assigned"
      : status === "IN_REVIEW"
        ? "In Review"
        : status === "COMPLETED"
          ? "Completed"
          : status;

  return (
    <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-white/55">
      {label}
    </div>
  );
}

function formatRecommendation(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
