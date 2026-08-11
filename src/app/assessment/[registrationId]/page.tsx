import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

type AssessmentPageProps = {
  params: Promise<{
    registrationId: string;
  }>;
};

export default async function AssessmentPage({
  params,
}: AssessmentPageProps) {
  const { registrationId } = await params;

  const registration =
    await prisma.registration.findUnique({
      where: {
        id: registrationId,
      },
      include: {
        event: true,
        assessment: true,
      },
    });

  if (!registration || !registration.assessment) {
    notFound();
  }

  const assessment = registration.assessment;

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link href="/" className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1685ff] font-black text-black">
              A
            </div>

            <div>
              <span className="block text-lg font-semibold tracking-[0.32em]">
                ASCEND
              </span>

              <span className="block text-[10px] uppercase tracking-[0.28em] text-white/45">
                Football Intelligence
              </span>
            </div>
          </Link>

          <div className="rounded-full border border-[#c7ff2f]/20 bg-[#c7ff2f]/[0.05] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
            {assessment.source === "DEMO"
              ? "AI ANALYSIS DEMO"
              : "Verified Assessment"}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
              Player Analysis
            </div>

            <h1 className="mt-3 text-4xl font-black sm:text-5xl">
              {registration.firstName} {registration.lastName}
            </h1>

            <p className="mt-3 text-white/50">
              {registration.primaryPosition} · {registration.nationality} ·{" "}
              {registration.event.edition}
            </p>

      {/* ASCEND AI VISUAL EVIDENCE */}
<section className="mt-10 overflow-hidden rounded-3xl border border-[#c7ff2f]/20 bg-white/[0.025]">
  <div className="flex flex-col gap-4 border-b border-white/10 px-7 py-6 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <div className="text-xs font-black uppercase tracking-[0.18em] text-[#c7ff2f]">
        ASCEND AI Player Analysis
      </div>

      <h2 className="mt-2 text-2xl font-black">
        Real footage. Real visual evidence.
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
        ASCEND computer vision detects, identifies and tracks the selected
        player through real match footage to support evidence-backed player
        analysis.
      </p>
    </div>

    <Link
      href={`/ai-demo/${registration.id}`}
      className="shrink-0 rounded-full border border-[#c7ff2f]/30 px-5 py-3 text-xs font-black uppercase tracking-[0.1em] text-[#c7ff2f] transition hover:bg-[#c7ff2f]/10"
    >
      Explore Visual Evidence →
    </Link>
  </div>

  <div>
    {/* REAL AI TRACKING VIDEO */}
    <div className="bg-black">
      <video
        controls
        preload="metadata"
        playsInline
        className="aspect-video h-full w-full bg-black object-contain"
        src="/ai-evidence/white9_camera_comp_web.mp4"
      />
    </div>

    {/* REAL EVIDENCE FIGURES */}
<div className="p-6">
  <div className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
    Visual Evidence
  </div>

  <div className="mt-6 grid grid-cols-2 gap-0 overflow-hidden rounded-2xl border border-white/10 lg:grid-cols-4">
    {/* PLAYER */}
    <div className="border-b border-white/10 p-5 lg:border-b-0 lg:border-r">
      <div className="text-xs uppercase tracking-[0.1em] text-white/35">
        Player Identity
      </div>

      <div className="mt-3 text-xl font-black">
        ASCEND Player 07
      </div>

      <div className="mt-1 text-xs text-white/35">
        White #9
      </div>
    </div>

    {/* FRAMES */}
    <div className="border-b border-l border-white/10 p-5 lg:border-b-0 lg:border-l-0 lg:border-r">
      <div className="text-xs uppercase tracking-[0.1em] text-white/35">
        Frames Analysed
      </div>

      <div className="mt-3 text-3xl font-black">
        240
      </div>

      <div className="mt-1 text-xs text-white/35">
        Evidence frames
      </div>
    </div>

    {/* COVERAGE */}
    <div className="p-5 lg:border-r lg:border-white/10">
      <div className="text-xs uppercase tracking-[0.1em] text-white/35">
        Tracking Coverage
      </div>

      <div className="mt-3 text-3xl font-black text-[#c7ff2f]">
        80.0%
      </div>

      <div className="mt-1 text-xs text-white/35">
        192 / 240 accepted
      </div>
    </div>

    {/* CONFIDENCE */}
    <div className="border-l border-white/10 p-5 lg:border-l-0">
      <div className="text-xs uppercase tracking-[0.1em] text-white/35">
        Detection Confidence
      </div>

      <div className="mt-3 text-3xl font-black">
        66.5%
      </div>

      <div className="mt-1 text-xs text-white/35">
        Accepted frames
      </div>
    </div>
  </div>

  <div className="mt-4 rounded-xl border border-[#c7ff2f]/15 bg-[#c7ff2f]/[0.05] px-5 py-3 text-xs text-white/45">
    Camera-compensated tracking prototype using real football footage.
  </div>
</div>
  </div>
</section>

            <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-7">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
                  AI Performance Score
                </div>

                <div className="mt-5 flex items-end gap-3">
                  <div className="text-7xl font-black text-[#c7ff2f]">
                    {assessment.overallScore ?? "--"}
                  </div>

                  <div className="pb-2 text-xl text-white/30">
                    /100
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <ScoreCard
                    label="Technical"
                    value={assessment.technicalScore}
                  />

                  <ScoreCard
                    label="Tactical"
                    value={assessment.tacticalScore}
                  />

                  <ScoreCard
                    label="Physical"
                    value={assessment.physicalScore}
                  />
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-7">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
                  AI Confidence
                </div>

                <div className="mt-5 text-5xl font-black">
                  {assessment.confidenceScore ?? "--"}%
                </div>

                <p className="mt-4 text-sm leading-6 text-white/45">
                  Confidence indicates the quality and consistency of the
                  evidence used to generate this assessment.
                </p>

                <div className="mt-6 rounded-xl border border-[#c7ff2f]/15 bg-[#c7ff2f]/[0.05] p-4 text-sm text-white/55">
                  {assessment.source === "DEMO"
                    ? "This assessment uses controlled demonstration data for product preview purposes."
                    : "This assessment is derived from verified event analysis data."}
                </div>
              </section>
            </div>

            <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.025] p-7">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
                    Performance Intelligence
                  </div>

                  <h2 className="mt-2 text-2xl font-black">
                    Key Football Metrics
                  </h2>
                </div>

                <Link
                  href={`/ai-demo/${registration.id}`}
                  className="rounded-full border border-[#c7ff2f]/25 bg-[#c7ff2f]/[0.05] px-5 py-3 text-xs font-black uppercase tracking-[0.1em] text-[#c7ff2f]"
                >
                  How ASCEND AI Generated This
                </Link>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <Metric
                  label="Movement"
                  value={assessment.movementScore}
                />
                <Metric
                  label="Positioning"
                  value={assessment.positioningScore}
                />
                <Metric
                  label="Decision Making"
                  value={assessment.decisionMakingScore}
                />
                <Metric
                  label="Passing"
                  value={assessment.passingScore}
                />
                <Metric
                  label="Defensive Impact"
                  value={assessment.defensiveImpactScore}
                />
                <Metric
                  label="Ball Control"
                  value={assessment.ballControlScore}
                />
                <Metric
                  label="Tackling"
                  value={assessment.tacklingScore}
                />
                <Metric
                  label="Aerial Ability"
                  value={assessment.aerialAbilityScore}
                />
                <Metric
                  label="Work Rate"
                  value={assessment.workRateScore}
                />
                <Metric
                  label="Composure"
                  value={assessment.composureScore}
                />
              </div>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-7">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
                  Physical Performance
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <PhysicalMetric
                    label="Top Speed"
                    value={
                      assessment.topSpeedKmh
                        ? `${assessment.topSpeedKmh} km/h`
                        : "--"
                    }
                  />

                  <PhysicalMetric
                    label="Distance Covered"
                    value={
                      assessment.distanceCoveredKm
                        ? `${assessment.distanceCoveredKm} km`
                        : "--"
                    }
                  />

                  <PhysicalMetric
                    label="Sprint Count"
                    value={
                      assessment.sprintCount?.toString() ?? "--"
                    }
                  />

                  <PhysicalMetric
                    label="High Intensity Runs"
                    value={
                      assessment.highIntensityRuns?.toString() ?? "--"
                    }
                  />

                  <PhysicalMetric
                    label="Accelerations"
                    value={
                      assessment.accelerations?.toString() ?? "--"
                    }
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-7">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
                  AI Scout Summary
                </div>

                <p className="mt-6 text-base leading-8 text-white/65">
                  {assessment.aiSummary ?? "No AI summary available."}
                </p>

                <div className="mt-6 border-t border-white/10 pt-5 text-xs leading-5 text-white/30">
                  AI analysis is designed to support scouting and development
                  decisions. Final football decisions should include human
                  evaluation and contextual review.
                </div>
              </div>
            </section>
          </div>

          <aside>
            <div className="sticky top-8 rounded-3xl border border-white/10 bg-white/[0.025] p-6">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
                Event Context
              </div>

              <div className="mt-5 text-xl font-black">
                {registration.event.edition}
              </div>

              <div className="mt-1 text-sm text-[#c7ff2f]">
                {registration.event.venue}
              </div>

              <div className="mt-6 space-y-4 border-t border-white/10 pt-6 text-sm">
                <Row
                  label="Position"
                  value={registration.primaryPosition ?? "--"}
                />

                <Row
                  label="Nationality"
                  value={registration.nationality ?? "--"}
                />

                <Row
                  label="Source"
                  value={assessment.source}
                />

                <Row
                  label="Assessment ID"
                  value={assessment.id}
                />
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function ScoreCard({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="text-xs uppercase tracking-[0.1em] text-white/35">
        {label}
      </div>

      <div className="mt-2 text-3xl font-black">
        {value ?? "--"}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="text-xs uppercase tracking-[0.08em] text-white/35">
        {label}
      </div>

      <div className="mt-3 text-3xl font-black">
        {value ?? "--"}
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#c7ff2f]"
          style={{
            width: `${Math.min(value ?? 0, 100)}%`,
          }}
        />
      </div>
    </div>
  );
}

function PhysicalMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="text-xs uppercase tracking-[0.08em] text-white/35">
        {label}
      </div>

      <div className="mt-2 text-2xl font-black">
        {value}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-5">
      <span className="text-white/35">
        {label}
      </span>

      <span className="max-w-[60%] text-right font-semibold">
        {value}
      </span>
    </div>
  );
}
