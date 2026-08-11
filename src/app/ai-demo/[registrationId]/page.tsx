import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

type AiDemoPageProps = {
  params: Promise<{
    registrationId: string;
  }>;
};

const evidence = {
  playerId: "07",
  shirt: "White #9",

  sourceWindow: "39.0s – 46.97s",

  totalFrames: 240,
  trackedFrames: 192,
  trackingCoverage: 80.0,
  averageDetectionConfidence: 66.5,

  analysisType: "Camera-compensated tracking",
  status: "Experimental visual evidence",

  timeline: [
    {
      time: "39.0s",
      status: "TRACKED",
      title: "Target identity locked",
      detail:
        "ASCEND identifies White #9 and assigns persistent Player ID 07.",
    },
    {
      time: "40.3s",
      status: "TRACKED",
      title: "Movement tracked",
      detail:
        "Player position continues to be followed while the camera pans.",
    },
    {
      time: "41.1s",
      status: "WITHHELD",
      title: "Identity confidence reduced",
      detail:
        "ASCEND withholds target identity instead of assigning Player ID 07 to another player.",
    },
    {
      time: "42.0s",
      status: "PREDICTED",
      title: "Camera-compensated prediction",
      detail:
        "Global camera motion is estimated to maintain the expected target region.",
    },
    {
      time: "43.2s",
      status: "TRACKED",
      title: "Target reacquired",
      detail:
        "White #9 is reacquired after the identity gate is satisfied.",
    },
    {
      time: "46.97s",
      status: "COMPLETE",
      title: "Evidence window complete",
      detail:
        "192 of 240 frames retained as accepted tracking evidence.",
    },
  ],
};

export default async function AiDemoPage({
  params,
}: AiDemoPageProps) {
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

  if (!registration) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link
            href={`/assessment/${registration.id}`}
            className="flex items-center gap-4"
          >
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
            Visual Evidence Demo
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
              How ASCEND AI Generated This
            </div>

            <h1 className="mt-3 text-4xl font-black sm:text-5xl">
              Visual Evidence Centre
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-7 text-white/55">
              See how ASCEND converts real football footage into
              evidence-backed player intelligence.
            </p>
          </div>

          <Link
            href={`/assessment/${registration.id}`}
            className="inline-flex rounded-full border border-white/15 px-5 py-3 text-xs font-black uppercase tracking-[0.1em] text-white/75 transition hover:border-white/30 hover:text-white"
          >
            Back to Assessment
          </Link>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            {/* REAL VIDEO */}
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
              <div className="border-b border-white/10 px-6 py-5">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
                  Real Match Footage
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-black">
                    ASCEND Player Tracking
                  </h2>

                  <span className="rounded-full border border-[#c7ff2f]/20 bg-[#c7ff2f]/[0.05] px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-[#c7ff2f]">
                    Real Evidence
                  </span>
                </div>
              </div>

              <div className="bg-black">
                <video
                  controls
                  preload="metadata"
                  className="aspect-video w-full bg-black"
                  src="/ai-evidence/white9_camera_comp_web.mp4"
                />
              </div>

              <div className="grid gap-4 border-t border-white/10 p-6 sm:grid-cols-4">
                <EvidenceStat
                  label="Evidence Window"
                  value={evidence.sourceWindow}
                />

                <EvidenceStat
                  label="Tracked Frames"
                  value={`${evidence.trackedFrames}/${evidence.totalFrames}`}
                />

                <EvidenceStat
                  label="Tracking Coverage"
                  value={`${evidence.trackingCoverage.toFixed(1)}%`}
                />

                <EvidenceStat
                  label="Avg Detection Confidence"
                  value={`${evidence.averageDetectionConfidence.toFixed(1)}%`}
                />
              </div>
            </section>

            {/* PIPELINE */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-7">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
                Analysis Pipeline
              </div>

              <h2 className="mt-2 text-2xl font-black">
                From footage to football intelligence
              </h2>

              <div className="mt-7 grid gap-4 md:grid-cols-4">
                <PipelineStep
                  number="01"
                  title="Player Detection"
                  text="Computer vision identifies footballers in each video frame."
                />

                <PipelineStep
                  number="02"
                  title="Identity Lock"
                  text="ASCEND assigns the selected player a persistent internal identity."
                />

                <PipelineStep
                  number="03"
                  title="Camera Compensation"
                  text="Camera movement is estimated so target motion is not confused with camera panning."
                />

                <PipelineStep
                  number="04"
                  title="Evidence Output"
                  text="Accepted tracking frames become visual evidence for player analysis."
                />
              </div>
            </section>

            {/* TRUST / COVERAGE */}
            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-7">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
                  Tracking Integrity
                </div>

                <div className="mt-5 text-5xl font-black text-[#c7ff2f]">
                  80.0%
                </div>

                <div className="mt-2 text-sm text-white/45">
                  accepted tracking coverage
                </div>

                <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#c7ff2f]"
                    style={{ width: "80%" }}
                  />
                </div>

                <p className="mt-6 text-sm leading-6 text-white/50">
                  ASCEND retained 192 of 240 analysed frames as accepted
                  target-tracking evidence. Frames where the system could
                  not safely maintain identity were withheld rather than
                  assigned to another player.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-7">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
                  Detection Quality
                </div>

                <div className="mt-5 text-5xl font-black">
                  66.5%
                </div>

                <div className="mt-2 text-sm text-white/45">
                  average person-detection confidence on accepted frames
                </div>

                <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/45">
                  This value reflects the computer-vision model&apos;s
                  confidence in person detection. It is not a player
                  identity-confidence score.
                </div>
              </div>
            </section>

            {/* TIMELINE */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-7">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
                Evidence Timeline
              </div>

              <h2 className="mt-2 text-2xl font-black">
                What ASCEND saw
              </h2>

              <div className="mt-8 space-y-0">
                {evidence.timeline.map((item, index) => (
                  <TimelineItem
                    key={`${item.time}-${item.status}`}
                    time={item.time}
                    status={item.status}
                    title={item.title}
                    detail={item.detail}
                    last={index === evidence.timeline.length - 1}
                  />
                ))}
              </div>
            </section>

            {/* DEMO VS MEASURED */}
            <section className="rounded-3xl border border-[#c7ff2f]/20 bg-[#c7ff2f]/[0.045] p-7">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-[#c7ff2f]">
                Evidence Transparency
              </div>

              <h2 className="mt-2 text-2xl font-black">
                Measured evidence vs demonstration assessment
              </h2>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/55">
                The tracking coverage, analysed frames, detection confidence
                and video shown on this page come from real football footage.
                The broader player-performance scores shown on the Assessment
                page are controlled demonstration values until ASCEND&apos;s
                full pitch calibration, event detection and metric engine are
                production validated.
              </p>
            </section>
          </div>

          <aside>
            <div className="sticky top-8 rounded-3xl border border-white/10 bg-white/[0.025] p-6">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
                Evidence Record
              </div>

              <div className="mt-5 text-xl font-black">
                {registration.firstName} {registration.lastName}
              </div>

              <div className="mt-1 text-[#c7ff2f]">
                ASCEND Player {evidence.playerId}
              </div>

              <div className="mt-6 space-y-4 border-t border-white/10 pt-6 text-sm">
                <Row
                  label="Target"
                  value={evidence.shirt}
                />

                <Row
                  label="Event"
                  value={registration.event.edition}
                />

                <Row
                  label="Analysis"
                  value={evidence.analysisType}
                />

                <Row
                  label="Evidence"
                  value={evidence.sourceWindow}
                />

                <Row
                  label="Status"
                  value="EXPERIMENTAL"
                />
              </div>

              <div className="mt-6 rounded-xl border border-[#c7ff2f]/15 bg-[#c7ff2f]/[0.05] p-4 text-sm leading-6 text-white/55">
                This prototype demonstrates ASCEND&apos;s visual-evidence
                architecture using real football footage.
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function EvidenceStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">
        {label}
      </div>

      <div className="mt-2 text-lg font-black">
        {value}
      </div>
    </div>
  );
}

function PipelineStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="text-xs font-black text-[#c7ff2f]">
        {number}
      </div>

      <div className="mt-3 font-black">
        {title}
      </div>

      <p className="mt-2 text-sm leading-6 text-white/45">
        {text}
      </p>
    </div>
  );
}

function TimelineItem({
  time,
  status,
  title,
  detail,
  last,
}: {
  time: string;
  status: string;
  title: string;
  detail: string;
  last: boolean;
}) {
  const highlight =
    status === "TRACKED" ||
    status === "COMPLETE";

  return (
    <div className="grid grid-cols-[76px_24px_1fr] gap-4">
      <div className="pt-1 text-xs font-black text-white/40">
        {time}
      </div>

      <div className="relative flex justify-center">
        <div
          className={`mt-1 h-3 w-3 rounded-full border ${
            highlight
              ? "border-[#c7ff2f] bg-[#c7ff2f]"
              : "border-white/25 bg-[#090909]"
          }`}
        />

        {!last && (
          <div className="absolute bottom-0 top-4 w-px bg-white/10" />
        )}
      </div>

      <div className="pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="font-black">
            {title}
          </div>

          <div
            className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] ${
              highlight
                ? "bg-[#c7ff2f]/10 text-[#c7ff2f]"
                : "bg-white/[0.05] text-white/40"
            }`}
          >
            {status}
          </div>
        </div>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
          {detail}
        </p>
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

      <span className="max-w-[62%] text-right font-semibold">
        {value}
      </span>
    </div>
  );
}
