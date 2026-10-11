import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireSelector } from "@/lib/selectors/auth";

import SelectorPlayVideoButton from "../SelectorPlayVideoButton";
import { submitSelectorAssessment } from "../actions";

type PageProps = {
  params: Promise<{
    assignmentId: string;
  }>;
};

const RECOMMENDATIONS = [
  ["LONGLIST", "YES — Recommend"],
  ["SECOND_REVIEW", "MAYBE — Needs further consideration"],
  ["NOT_SELECTED", "NO — Do not recommend"],
] as const;

export default async function SelectorAssignmentPage({ params }: PageProps) {
  const selector = await requireSelector();
  const { assignmentId } = await params;

  const assignment = await prisma.selectorAssignment.findFirst({
    where: {
      id: assignmentId,
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
            orderBy: {
              createdAt: "asc",
            },
            select: {
              id: true,
              type: true,
              originalFilename: true,
              durationSeconds: true,
            },
          },
        },
      },

      assessment: {
        select: {
          technical: true,
          tactical: true,
          physical: true,
          positioning: true,
          decisionMaking: true,
          potential: true,
          notes: true,
          recommendation: true,
          submittedAt: true,
        },
      },
    },
  });

  if (!assignment) {
    notFound();
  }

  const assessmentCode =
    assignment.application.assessmentCode || "Assessment pending";

  const completed = assignment.status === "COMPLETED";

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 text-white sm:px-8">
      <div className="mb-8">
        <Link
          href="/selectors/assignments"
          className="text-xs font-black uppercase tracking-[0.1em] text-white/45 transition hover:text-white"
        >
          ← Assessment Queue
        </Link>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.14em] text-[#c7ff2f]">
              Anonymous Player Assessment
            </div>

            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              {assessmentCode}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
              Review the football evidence and make an independent
              recommendation. Personal identity and contact information are
              intentionally hidden from this workspace.
            </p>
          </div>

          <StatusBadge status={assignment.status} />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard label="Round" value={String(assignment.round)} />
          <InfoCard
            label="Primary Position"
            value={assignment.application.position || "—"}
          />
          <InfoCard
            label="Secondary Position"
            value={assignment.application.secondaryPosition || "—"}
          />
          <InfoCard
            label="Preferred Foot"
            value={assignment.application.preferredFoot || "—"}
          />
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
        <div className="text-xs font-black uppercase tracking-[0.14em] text-white/35">
          Football Evidence
        </div>

        <h2 className="mt-2 text-2xl font-black">Player Videos</h2>

        {assignment.application.videos.length ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {assignment.application.videos.map((video, index) => (
              <div
                key={video.id}
                className="rounded-2xl border border-white/10 bg-black/20 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-black">Video {index + 1}</div>

                    <div className="mt-1 text-xs text-white/40">
                      {formatVideoType(video.type)}
                    </div>
                  </div>

                  {video.durationSeconds ? (
                    <div className="text-xs font-bold text-white/40">
                      {formatDuration(video.durationSeconds)}
                    </div>
                  ) : null}
                </div>

                {video.originalFilename ? (
                  <div className="mt-4 truncate text-xs text-white/35">
                    {video.originalFilename}
                  </div>
                ) : null}

                <div className="mt-5">
                  <SelectorPlayVideoButton
                    assignmentId={assignment.id}
                    videoId={video.id}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-6 text-sm text-white/45">
            No playable video evidence is currently available.
          </div>
        )}
      </section>

      {!completed ? (
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
          <div className="text-xs font-black uppercase tracking-[0.14em] text-[#c7ff2f]">
            Selector Decision
          </div>

          <h2 className="mt-2 text-2xl font-black">Assess the Player</h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
            Review the available football evidence and choose the recommendation
            that best reflects your assessment.
          </p>

          <form action={submitSelectorAssessment} className="mt-8">
            <input type="hidden" name="assignmentId" value={assignment.id} />

            <fieldset>
              <legend className="text-xs font-black uppercase tracking-[0.08em] text-white/45">
                Recommendation
              </legend>

              <div className="mt-3 grid gap-3">
                {RECOMMENDATIONS.map(([value, label]) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm font-bold transition hover:border-white/20"
                  >
                    <input
                      type="radio"
                      name="recommendation"
                      value={value}
                      required
                      className="h-4 w-4"
                    />

                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-6">
              <label className="text-xs font-black uppercase tracking-[0.08em] text-white/45">
                Selector Notes — Optional
              </label>

              <textarea
                name="notes"
                rows={6}
                placeholder="Football observations, strengths, concerns or context..."
                className="mt-3 block w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm leading-6 text-white outline-none transition placeholder:text-white/20 focus:border-[#c7ff2f]/50"
              />
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="mb-5 max-w-2xl text-xs leading-5 text-white/35">
                Submission completes this assessment and makes the
                recommendation available to the authorised selection team.
              </p>

              <button
                type="submit"
                className="rounded-full bg-[#c7ff2f] px-7 py-3 text-xs font-black uppercase tracking-[0.1em] text-black transition hover:opacity-90"
              >
                Submit Assessment
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {completed && assignment.assessment ? (
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
          <div className="text-xs font-black uppercase tracking-[0.14em] text-[#c7ff2f]">
            Assessment Submitted
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="text-xs font-black uppercase tracking-[0.08em] text-white/35">
                Recommendation
              </div>

              <div className="mt-2 text-lg font-black">
                {assignment.assessment.recommendation
                  ? formatRecommendation(assignment.assessment.recommendation)
                  : "—"}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="text-xs font-black uppercase tracking-[0.08em] text-white/35">
                Submitted
              </div>

              <div className="mt-2 text-sm font-bold">
                {assignment.assessment.submittedAt
                  ? assignment.assessment.submittedAt.toLocaleString("en-GB")
                  : "—"}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="text-xs font-black uppercase tracking-[0.08em] text-white/35">
              Selector Notes
            </div>

            <div className="mt-3 whitespace-pre-wrap text-sm leading-6 text-white/65">
              {assignment.assessment.notes || "No notes submitted."}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="text-xs font-black uppercase tracking-[0.08em] text-white/35">
        {label}
      </div>

      <div className="mt-2 text-lg font-black">{value}</div>
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
    <div className="w-fit rounded-full border border-white/10 bg-black/30 px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-white/55">
      {label}
    </div>
  );
}

function formatRecommendation(value: string) {
  if (value === "LONGLIST") return "YES — Recommend";
  if (value === "SECOND_REVIEW") {
    return "MAYBE — Needs further consideration";
  }
  if (value === "NOT_SELECTED") return "NO — Do not recommend";

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatVideoType(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}
