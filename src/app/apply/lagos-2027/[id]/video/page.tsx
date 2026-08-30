"use client";

import Link from "next/link";
import {
  ChangeEvent,
  useEffect,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

const steps = [
  "Player",
  "Contact",
  "Representation",
  "Video",
  "Identity",
  "Consent",
  "Review",
  "Assessment Fee",
  "Payment",
  "Confirmation",
];

type VideoType =
  | "MATCH_1"
  | "MATCH_2"
  | "HIGHLIGHTS"
  | "ADDITIONAL_MATCH"
  | "FULL_MATCH";

type InitialVideoType =
  | "MATCH_1"
  | "MATCH_2"
  | "HIGHLIGHTS";

type ExistingVideo = {
  id: string;
  type: string;
  status: string;
  originalFilename: string | null;
  sizeBytes: string | null;
  requestId: string | null;
};

type VideoRequest = {
  id: string;
  requestedCount: number;

  requestedVideoType:
    | "ADDITIONAL_MATCH"
    | "FULL_MATCH";

  instructions: string | null;

  deadline: string | null;
  completedAt: string | null;

  videos: ExistingVideo[];
};

type Application = {
  id: string;
  firstName: string;
  lastName: string;
  position: string | null;
  age: number | null;
  nationality: string | null;
  currentClub: string | null;
  status: string;
  videos: ExistingVideo[];
  videoRequests: VideoRequest[];
};

type UploadState = {
  file: File | null;
  videoId: string | null;
  progress: number;
  uploading: boolean;
  uploaded: boolean;
  filename: string;
  error: string;
};

const emptyUpload = (): UploadState => ({
  file: null,
  videoId: null,
  progress: 0,
  uploading: false,
  uploaded: false,
  filename: "",
  error: "",
});

export default function VideoPage() {
  const params =
    useParams<{ id: string }>();

  const router = useRouter();
  const id = params.id;

  const [application, setApplication] =
    useState<Application | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [pageError, setPageError] =
    useState("");

  const [uploads, setUploads] =
    useState<Record<InitialVideoType, UploadState>>({
      MATCH_1: emptyUpload(),
      MATCH_2: emptyUpload(),
      HIGHLIGHTS: emptyUpload(),
    });

  useEffect(() => {
    loadApplication();
  }, [id]);

  async function loadApplication() {
    try {
      const response = await fetch(
        `/api/showcase-applications/${id}/videos`
      );

      const data =
        await response.json();

      if (!response.ok) {
        setPageError(
          data.error ||
            "Application not found."
        );
        return;
      }

      const record =
        data.application as Application;

      setApplication(record);

      setUploads((current) => {
        const next = { ...current };

        for (const type of [
          "MATCH_1",
          "MATCH_2",
          "HIGHLIGHTS",
        ] as InitialVideoType[]) {
          const existing =
            record.videos.find(
              (video) =>
                video.type === type &&
                ["SUBMITTED", "READY"].includes(
                  video.status
                )
            );

          if (existing) {
            next[type] = {
              ...next[type],
              videoId: existing.id,
              uploaded: true,
              progress: 100,
              filename:
                existing.originalFilename ||
                "Video submitted",
            };
          }
        }

        return next;
      });
    } catch {
      setPageError(
        "We could not load your video submission."
      );
    } finally {
      setLoading(false);
    }
  }

  function chooseFile(
    type: InitialVideoType,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0] ||
      null;

    if (!file) {
      return;
    }

    const max =
      500 * 1024 * 1024;

    if (file.size > max) {
      updateUpload(type, {
        error:
          "Maximum file size is 500 MB.",
      });
      return;
    }

    updateUpload(type, {
      file,
      filename: file.name,
      uploaded: false,
      progress: 0,
      error: "",
    });
  }

  function updateUpload(
    type: InitialVideoType,
    partial: Partial<UploadState>
  ) {
    setUploads((current) => ({
      ...current,
      [type]: {
        ...current[type],
        ...partial,
      },
    }));
  }

  async function uploadVideo(
    type: InitialVideoType
  ) {
    const state = uploads[type];

    if (!state.file) {
      updateUpload(type, {
        error:
          "Please select a video first.",
      });
      return;
    }

    updateUpload(type, {
      uploading: true,
      error: "",
      progress: 0,
    });

    try {
      const presignResponse =
        await fetch(
          `/api/showcase-applications/${id}/videos/presign`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              filename:
                state.file.name,
              contentType:
                state.file.type,
              size:
                state.file.size,
              videoType: type,
            }),
          }
        );

      const presign =
        await presignResponse.json();

      if (!presignResponse.ok) {
        throw new Error(
          presign.error ||
            "Unable to prepare upload."
        );
      }

      await uploadToR2(
        presign.uploadUrl,
        state.file,
        (progress) => {
          updateUpload(type, {
            progress,
          });
        }
      );

      const completeResponse =
        await fetch(
          `/api/showcase-applications/${id}/videos/complete`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              videoId:
                presign.videoId,
              storageKey:
                presign.storageKey,
              originalFilename:
                state.file.name,
              mimeType:
                state.file.type,
              size:
                state.file.size,
            }),
          }
        );

      const complete =
        await completeResponse.json();

      if (!completeResponse.ok) {
        throw new Error(
          complete.error ||
            "Video uploaded but could not be saved."
        );
      }

      updateUpload(type, {
        videoId: complete.video.id,
        uploading: false,
        uploaded: true,
        progress: 100,
        file: null,
      });

      await loadApplication();
    } catch (error) {
      updateUpload(type, {
        uploading: false,
        error:
          error instanceof Error
            ? error.message
            : "Video upload failed.",
      });
    }
  }

  const allRequiredUploaded =
    uploads.MATCH_1.uploaded &&
    uploads.MATCH_2.uploaded &&
    uploads.HIGHLIGHTS.uploaded;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#090909] px-6 py-16 text-white">
        Loading video submission...
      </main>
    );
  }

  if (!application) {
    return (
      <main className="min-h-screen bg-[#090909] px-6 py-16 text-white">
        <h1 className="text-3xl font-black">
          Application not found
        </h1>

        {pageError ? (
          <p className="mt-4 text-red-300">
            {pageError}
          </p>
        ) : null}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-4"
          >
            <svg
              viewBox="0 0 54 54"
              className="h-10 w-10"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M27 3 49 46 27 35 5 46 27 3Z"
                fill="#1685ff"
              />
              <path
                d="M27 15 38 37 27 31 16 37 27 15Z"
                fill="#020812"
              />
            </svg>

            <div>
              <span className="block text-lg font-semibold tracking-[0.36em]">
                ASCEND
              </span>

              <span className="block text-[10px] uppercase tracking-[0.28em] text-white/45">
                Football Showcase
              </span>
            </div>
          </Link>

          <Link
            href="/apply/lagos-2027"
            className="text-sm font-medium text-white/60 transition hover:text-white"
          >
            Back to application
          </Link>
        </div>
      </header>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl overflow-x-auto px-6 lg:px-8">
          <div className="flex min-w-[1050px]">
            {steps.map((step, index) => (
              <div
                key={step}
                className="flex flex-1 items-center gap-2 border-r border-white/10 py-5 pr-3"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                    index === 3
                      ? "bg-[#c7ff2f] text-black"
                      : index < 3
                        ? "bg-white/10 text-white"
                        : "border border-white/15 text-white/40"
                  }`}
                >
                  {index + 1}
                </div>

                <span
                  className={`text-[10px] font-bold uppercase tracking-[0.08em] ${
                    index === 3
                      ? "text-white"
                      : "text-white/35"
                  }`}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1fr_340px] lg:px-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#c7ff2f]">
            Step 4 of 9
          </div>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Video Assessment
          </h1>

          <p className="mt-3 max-w-3xl text-white/55">
            Submit multiple examples of your football
            performance so the ASCEND assessment team
            can evaluate you across different situations.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <h2 className="text-xl font-black">
              Initial assessment requirement
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/50">
              Three videos are required for the initial
              assessment. Match footage should show enough
              continuous play for the assessment team to
              understand your positioning, movement,
              decision-making and involvement in the game.
            </p>
          </div>

          <div className="mt-8 grid gap-5 xl:grid-cols-4">
            <VideoUploadCard
              title="Match Footage 1"
              description="Continuous match footage from a competitive game."
              type="MATCH_1"
              state={uploads.MATCH_1}
              onChoose={chooseFile}
              onUpload={uploadVideo}
            />

            <VideoUploadCard
              title="Match Footage 2"
              description="Footage from a second match or different period of play."
              type="MATCH_2"
              state={uploads.MATCH_2}
              onChoose={chooseFile}
              onUpload={uploadVideo}
            />

            <VideoUploadCard
              title="Highlights / Position Evidence"
              description="Additional evidence showing your strongest actions and position-specific qualities."
              type="HIGHLIGHTS"
              state={uploads.HIGHLIGHTS}
              onChoose={chooseFile}
              onUpload={uploadVideo}
            />

            <MoreVideosCard
              applicationId={id}
              videos={application.videos}
              onUploaded={loadApplication}
            />
          </div>

{application.videoRequests.length > 0 ? (
  <div className="mt-10 space-y-8">
    {application.videoRequests.map(
      (request, requestIndex) => {
        const submittedVideos =
          request.videos.filter(
            (video) =>
              [
                "SUBMITTED",
                "PROCESSING",
                "READY",
              ].includes(
                video.status
              )
          );

        const submittedCount =
          submittedVideos.length;

        const remainingCount =
          Math.max(
            request.requestedCount -
              submittedCount,
            0
          );

        const complete =
          remainingCount === 0;

        return (
          <section
            key={request.id}
            className="rounded-2xl border border-[#c7ff2f]/25 bg-[#c7ff2f]/[0.035] p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.18em] text-[#c7ff2f]">
                  Additional Footage Request{" "}
                  {requestIndex + 1}
                </div>

                <h2 className="mt-3 text-2xl font-black">
                  ASCEND has requested{" "}
                  {
                    request.requestedCount
                  }{" "}
                  additional{" "}
                  {request.requestedCount ===
                  1
                    ? "video"
                    : "videos"}
                </h2>

                {request.instructions ? (
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">
                    {
                      request.instructions
                    }
                  </p>
                ) : null}
              </div>

              <div
                className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.08em] ${
                  complete
                    ? "bg-[#c7ff2f]/10 text-[#c7ff2f]"
                    : "bg-amber-400/10 text-amber-300"
                }`}
              >
                {complete
                  ? "Complete"
                  : `${submittedCount} / ${request.requestedCount} received`}
              </div>
            </div>

            {request.deadline ? (
              <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
                <span className="text-white/40">
                  Deadline:
                </span>{" "}

                <span className="font-bold text-white">
                  {new Date(
                    request.deadline
                  ).toLocaleDateString(
                    "en-GB",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </span>
              </div>
            ) : null}

            {submittedVideos.length >
            0 ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {submittedVideos.map(
                  (video, index) => (
                    <div
                      key={video.id}
                      className="rounded-xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="text-xs font-black text-[#c7ff2f]">
                        ✓ Additional Video{" "}
                        {index + 1}
                      </div>

                      <div className="mt-2 truncate text-xs text-white/40">
                        {
                          video.originalFilename
                        }
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : null}

            {!complete ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({
                  length:
                    remainingCount,
                }).map((_, index) => (
                  <AdditionalVideoUploader
                    key={`${request.id}-${index}`}
                    applicationId={id}
                    requestId={
                      request.id
                    }
                    videoType={
                      request.requestedVideoType
                    }
                    label={`Upload Additional Video ${
                      submittedCount +
                      index +
                      1
                    }`}
                    onUploaded={
                      loadApplication
                    }
                  />
                ))}
              </div>
            ) : null}
          </section>
        );
      }
    )}
  </div>
) : null}

          <div className="mt-8 rounded-2xl border border-amber-400/20 bg-amber-400/[0.07] p-6">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">
              Additional video evidence may be requested
            </div>

            <p className="mt-3 text-sm leading-6 text-white/60">
              Players who progress to the longlist or
              final review stage may be asked to provide
              further match footage, additional video
              evidence or full-match footage before a
              final selection decision is made.
            </p>

            <p className="mt-3 text-sm font-semibold leading-6 text-white">
              Failure to provide requested additional
              footage within the stated deadline may
              affect progression in the selection process.
            </p>
          </div>

          {pageError ? (
            <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-semibold text-red-200">
              {pageError}
            </div>
          ) : null}

          <div className="mt-8 flex items-center justify-between">
            <Link
              href={`/apply/lagos-2027/${id}/representation`}
              className="text-sm font-bold text-white/50 transition hover:text-white"
            >
              ← Back
            </Link>

            <button
              type="button"
              disabled={
                !allRequiredUploaded
              }
              onClick={() =>
                router.push(
                  `/apply/lagos-2027/${id}/identity`
                )
              }
              className="rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
            </button>
          </div>

          {!allRequiredUploaded ? (
            <p className="mt-3 text-right text-xs text-white/35">
              All three assessment videos must be
              submitted before you can continue.
            </p>
          ) : null}
        </div>

        <aside>
          <div className="sticky top-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/40">
              Application
            </div>

            <div className="mt-5 text-xl font-black">
              {application.firstName}{" "}
              {application.lastName}
            </div>

            <div className="mt-1 text-[#c7ff2f]">
              Lagos 2027
            </div>

            <div className="mt-6 space-y-4 border-t border-white/10 pt-6 text-sm">
              <div className="flex justify-between gap-6">
                <span className="text-white/40">
                  Position
                </span>
                <span>
                  {application.position || "—"}
                </span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-white/40">
                  Videos required
                </span>
                <span>3</span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-white/40">
                  Submitted
                </span>

                <span>
                  {
                    [
                      uploads.MATCH_1.uploaded,
                      uploads.MATCH_2.uploaded,
                      uploads.HIGHLIGHTS.uploaded,
                    ].filter(Boolean).length
                  }{" "}
                  / 3
                </span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-white/40">
                  Selection
                </span>
                <span>Best 100</span>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-[#c7ff2f]/15 bg-[#c7ff2f]/[0.05] p-4 text-sm leading-6 text-white/60">
              Submitted video is used as evidence
              during the ASCEND player assessment
              process.
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function VideoUploadCard({
  title,
  description,
  type,
  state,
  onChoose,
  onUpload,
}: {
  title: string;
  description: string;
  type: InitialVideoType;
  state: UploadState;

  onChoose: (
    type: InitialVideoType,
    event: ChangeEvent<HTMLInputElement>
  ) => void;

  onUpload: (
    type: InitialVideoType
  ) => Promise<void>;
}) {

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black">
            {title}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
            {description}
          </p>
        </div>

        {state.uploaded ? (
          <span className="rounded-full bg-[#c7ff2f]/10 px-3 py-1 text-xs font-black text-[#c7ff2f]">
            ✓ Submitted
          </span>
        ) : null}
      </div>

      <div className="mt-5 rounded-xl border border-dashed border-white/15 bg-black/20 p-5">
        <div className="flex flex-wrap items-center gap-4">
          <label className="cursor-pointer rounded-full border border-white/15 px-5 py-3 text-xs font-black uppercase tracking-[0.08em] transition hover:border-[#c7ff2f]/50">
            Choose Video

            <input
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              className="sr-only"
              disabled={state.uploading}
              onChange={(event) =>
                onChoose(
                  type,
                  event
                )
              }
            />
          </label>

          <div className="min-w-0 flex-1 text-sm text-white/45">
            {state.filename ||
              "MP4, MOV or WebM · Maximum 500 MB"}
          </div>

          {state.file &&
          !state.uploaded ? (
            <button
              type="button"
              disabled={state.uploading}
              onClick={() =>
                onUpload(type)
              }
              className="rounded-full bg-[#c7ff2f] px-5 py-3 text-xs font-black uppercase tracking-[0.08em] text-black disabled:opacity-40"
            >
              {state.uploading
                ? "Uploading..."
                : "Upload"}
            </button>
          ) : null}
        </div>

        {state.uploading ? (
          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs text-white/45">
              <span>
                Uploading to ASCEND
              </span>
              <span>
                {state.progress}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-[#c7ff2f] transition-all"
                style={{
                  width: `${state.progress}%`,
                }}
              />
            </div>
          </div>
        ) : null}

        {state.error ? (
          <p className="mt-4 text-sm font-semibold text-red-300">
            {state.error}
          </p>
        ) : null}

        {state.uploaded ? (
          <p className="mt-4 text-xs text-white/40">
            You can choose another file above
            if you want to replace this video.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function AdditionalVideoUploader({
  applicationId,
  videoType,
  requestId,
  label,
  onUploaded,
}: {
  applicationId: string;

  videoType:
    | "ADDITIONAL_MATCH"
    | "FULL_MATCH";

  requestId?: string;

  label: string;

  onUploaded: () => Promise<void>;
}) {
  const [file, setFile] =
    useState<File | null>(null);

  const [filename, setFilename] =
    useState("");

  const [uploading, setUploading] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [error, setError] =
    useState("");

  async function handleUpload() {
    if (!file) {
      setError(
        "Please choose a video first."
      );
      return;
    }

    setUploading(true);
    setProgress(0);
    setError("");

    try {
      const presignResponse =
        await fetch(
          `/api/showcase-applications/${applicationId}/videos/presign`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              filename: file.name,
              contentType: file.type,
              size: file.size,
              videoType,
              requestId:
                requestId || null,
            }),
          }
        );

      const presign =
        await presignResponse.json();

      if (!presignResponse.ok) {
        throw new Error(
          presign.error ||
            "Unable to prepare video upload."
        );
      }

      await uploadToR2(
        presign.uploadUrl,
        file,
        (value) =>
          setProgress(value)
      );

      const completeResponse =
        await fetch(
          `/api/showcase-applications/${applicationId}/videos/complete`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              videoId:
                presign.videoId,

              storageKey:
                presign.storageKey,

              originalFilename:
                file.name,

              mimeType:
                file.type,

              size:
                file.size,
            }),
          }
        );

      const complete =
        await completeResponse.json();

      if (!completeResponse.ok) {
        throw new Error(
          complete.error ||
            "Video uploaded but could not be saved."
        );
      }

      setFile(null);
      setFilename("");
      setProgress(100);

      await onUploaded();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Video upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-xl border border-dashed border-white/15 bg-black/20 p-4">
      <label className="block cursor-pointer rounded-full border border-white/15 px-4 py-3 text-center text-xs font-black uppercase tracking-[0.08em] transition hover:border-[#c7ff2f]/50">
        {label}

        <input
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          className="sr-only"
          disabled={uploading}
          onChange={(event) => {
            const selected =
              event.target.files?.[0];

            if (!selected) {
              return;
            }

            const max =
              500 *
              1024 *
              1024;

            if (
              selected.size > max
            ) {
              setError(
                "Maximum file size is 500 MB."
              );
              return;
            }

            setFile(selected);
            setFilename(
              selected.name
            );
            setError("");
            setProgress(0);
          }}
        />
      </label>

      <div className="mt-3 break-words text-xs text-white/40">
        {filename ||
          "MP4, MOV or WebM · Maximum 500 MB"}
      </div>

      {file ? (
        <button
          type="button"
          disabled={uploading}
          onClick={handleUpload}
          className="mt-4 w-full rounded-full bg-[#c7ff2f] px-5 py-3 text-xs font-black uppercase tracking-[0.08em] text-black disabled:opacity-40"
        >
          {uploading
            ? "Uploading..."
            : "Upload Video"}
        </button>
      ) : null}

      {uploading ? (
        <div className="mt-4">
          <div className="mb-2 flex justify-between text-xs text-white/40">
            <span>
              Uploading to ASCEND
            </span>

            <span>
              {progress}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-[#c7ff2f] transition-all"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 text-xs font-semibold text-red-300">
          {error}
        </div>
      ) : null}
    </div>
  );
}

function uploadToR2(
  uploadUrl: string,
  file: File,
  onProgress: (
    progress: number
  ) => void
) {
  return new Promise<void>(
    (resolve, reject) => {
      const xhr =
        new XMLHttpRequest();

      xhr.open(
        "PUT",
        uploadUrl,
        true
      );

      xhr.setRequestHeader(
        "Content-Type",
        file.type
      );

      xhr.upload.onprogress = (
        event
      ) => {
        if (
          !event.lengthComputable
        ) {
          return;
        }

        const progress =
          Math.round(
            (event.loaded /
              event.total) *
              100
          );

        onProgress(progress);
      };

      xhr.onload = () => {
        if (
          xhr.status >= 200 &&
          xhr.status < 300
        ) {
          onProgress(100);
          resolve();
        } else {
          reject(
            new Error(
              "Video upload failed."
            )
          );
        }
      };

      xhr.onerror = () => {
        reject(
          new Error(
            "The video upload was interrupted. Please try again."
          )
        );
      };

      xhr.send(file);
    }
  );
}

function MoreVideosCard({
  applicationId,
  videos,
  onUploaded,
}: {
  applicationId: string;
  videos: ExistingVideo[];
  onUploaded: () => Promise<void>;
}) {
  const voluntaryVideos = videos.filter(
    (video) =>
      video.type === "ADDITIONAL_MATCH" &&
      !video.requestId &&
      ["SUBMITTED", "PROCESSING", "READY"].includes(
        video.status
      )
  );

  const MAX_VOLUNTARY_VIDEOS = 2;

  const canAddMore =
    voluntaryVideos.length <
    MAX_VOLUNTARY_VIDEOS;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-dashed border-[#c7ff2f]/50 bg-[#c7ff2f]/[0.025] p-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#c7ff2f]/40 text-2xl text-[#c7ff2f]">
        +
      </div>

      <h2 className="mt-5 text-lg font-black">
        More Videos
      </h2>

      <span className="mt-2 w-fit rounded-full bg-[#c7ff2f]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
        Optional
      </span>

      <p className="mt-4 text-sm leading-6 text-white/45">
        You may submit up to two additional
        videos if they provide useful evidence
        that is not already shown in your
        required footage.
      </p>

      <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/45">
        Additional footage submitted:{" "}
        <span className="font-bold text-white">
          {voluntaryVideos.length}
        </span>{" "}
        / {MAX_VOLUNTARY_VIDEOS}
      </div>

      {voluntaryVideos.length > 0 ? (
        <div className="mt-4 space-y-2">
          {voluntaryVideos.map(
            (video, index) => (
              <div
                key={video.id}
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
              >
                <div className="text-xs font-bold text-[#c7ff2f]">
                  ✓ Additional Video{" "}
                  {index + 1}
                </div>

                <div className="mt-1 truncate text-xs text-white/40">
                  {video.originalFilename ||
                    "Video submitted"}
                </div>
              </div>
            )
          )}
        </div>
      ) : null}

      {canAddMore ? (
        <div className="mt-5">
          <AdditionalVideoUploader
            applicationId={applicationId}
            videoType="ADDITIONAL_MATCH"
            label={`Add Additional Video ${
              voluntaryVideos.length + 1
            }`}
            onUploaded={onUploaded}
          />
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-[#c7ff2f]/15 bg-[#c7ff2f]/[0.05] p-4 text-xs leading-5 text-white/50">
          You have submitted the maximum
          number of optional additional videos.
        </div>
      )}

      <p className="mt-5 text-xs leading-5 text-white/35">
        Further footage may still be formally
        requested by ASCEND if your application
        progresses.
      </p>
    </div>
  );
}
