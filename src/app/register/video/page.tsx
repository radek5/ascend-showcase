"use client";

import { Suspense, useState } from "react";

import Link from "next/link";
import { activeEvent } from "@/data/event";

import { useSearchParams, useRouter } from "next/navigation";

function VideoPageContent() {
  const [videoFileName, setVideoFileName] = useState("");
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoLink, setVideoLink] = useState("");

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const registrationId = searchParams.get("registration");

  const [error, setError] = useState("");
  
  async function uploadDirectVideo() {
  if (!registrationId) {
    throw new Error(
      "Registration session not found.",
    );
  }

  if (!videoFile) {
    return;
  }

  const presignResponse = await fetch(
    "/api/video-upload/presign",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        registrationId,
        filename: videoFile.name,
        contentType: videoFile.type,
        size: videoFile.size,
      }),
    },
  );

  const presignData =
    await presignResponse.json();

  if (!presignResponse.ok) {
    throw new Error(
      presignData.error ||
        "Unable to prepare video upload.",
    );
  }

  const uploadResponse = await fetch(
    presignData.uploadUrl,
    {
      method: "PUT",
      headers: {
        "Content-Type": videoFile.type,
      },
      body: videoFile,
    },
  );

  if (!uploadResponse.ok) {
    throw new Error(
      "Video upload failed.",
    );
  }

  const completeResponse = await fetch(
    "/api/video-upload/complete",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        registrationId,
        storageKey:
          presignData.storageKey,
        originalFilename:
          videoFile.name,
        mimeType:
          videoFile.type,
        size:
          videoFile.size,
      }),
    },
  );

  const completeData =
    await completeResponse.json();

  if (!completeResponse.ok) {
    throw new Error(
      completeData.error ||
        "Video uploaded but its details could not be saved.",
    );
  }
}

async function handleContinue() {
  if (!registrationId) {
    setError(
      "Registration session not found. Please return to registration and continue again.",
    );
    return;
  }

  try {
    setUploading(true);
    setError("");

    // Upload selected local video to R2 first.
    if (videoFile) {
      await uploadDirectVideo();
    }

    // If an external video link was entered, save that too.
    if (videoLink.trim()) {
      const response = await fetch(
        "/api/video-upload/external",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            registrationId,
            videoLink: videoLink.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to save video link.",
        );
      }
    }

    router.push(
      `/register/medical-consent?registration=${registrationId}`,
    );
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "Unable to save video.",
    );
  } finally {
    setUploading(false);
  }
}

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link href="/" className="flex items-center gap-4">
            <svg
              viewBox="0 0 54 54"
              className="h-10 w-10"
              fill="none"
              aria-hidden="true"
            >
              <path d="M27 3 49 46 27 35 5 46 27 3Z" fill="#1685ff" />
              <path d="M27 15 38 37 27 31 16 37 27 15Z" fill="#020812" />
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
            href="/register"
            className="text-sm font-medium text-white/60 transition hover:text-white"
          >
            Back
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1fr_340px] lg:px-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#c7ff2f]">
            Step 4 of 8
          </div>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Player Video
          </h1>

          <p className="mt-3 max-w-2xl text-white/55">
            Upload a short football video so the ASCEND team can better
            understand your playing profile before the showcase.
          </p>

          <div className="mt-10 rounded-2xl border border-dashed border-white/15 bg-white/[0.025] p-8">
            <div className="text-lg font-black">Upload football video</div>

            <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
              Recommended length: 3–5 minutes. Maximum: 5 minutes.
              Match footage, training clips or highlights are all acceptable.
            </p>

<div className="mt-6">
  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/30 px-6 py-12 text-center transition hover:border-[#c7ff2f]/40">
    <div className="rounded-full bg-[#c7ff2f] px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-black">
      Upload Football Video
    </div>

    <div className="mt-3 text-xs text-white/40">
      MP4, MOV or WebM
    </div>

    <input
      type="file"
      accept="video/mp4,video/quicktime,video/webm"
      className="sr-only"
      onChange={(event) => {
        const file = event.target.files?.[0];

        if (!file) {
          setVideoFile(null); 
          setVideoFileName("");
          setVideoPreview(null);
          return;
        }
 
        setVideoFile(file);
        setVideoFileName(file.name);

        if (videoPreview) {
          URL.revokeObjectURL(videoPreview);
        }

        const url = URL.createObjectURL(file);
        setVideoPreview(url);
      }}
    />
  </label>

  {videoFileName ? (
    <div className="mt-4 text-xs font-bold text-[#c7ff2f]">
      ✓ Selected: {videoFileName}
    </div>
  ) : (
    <div className="mt-4 text-xs text-white/35">
      No video selected
    </div>
  )}

  {videoPreview && (
    <video
      src={videoPreview}
      controls
      className="mt-6 w-full rounded-2xl border border-white/10 bg-black"
    />
  )}
</div>

            <div className="mt-8 border-t border-white/10 pt-8">
              <div className="text-sm font-bold">
                Or add a video link
              </div>

              <p className="mt-2 text-sm text-white/45">
                You can use a YouTube, Vimeo or shareable Google Drive link.
              </p>

              <input
                name="videoLink"
                type="url"
                placeholder="https://..."
                value={videoLink}
                onChange={(event) => setVideoLink(event.target.value)}
                className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none transition placeholder:text-white/20 focus:border-[#c7ff2f]/60"
              />
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="text-sm font-black uppercase tracking-[0.1em] text-[#c7ff2f]">
              What should the video show?
            </div>

            <div className="mt-5 grid gap-4 text-sm leading-6 text-white/55 sm:grid-cols-2">
              <div>
                <span className="font-bold text-white">Outfield players</span>
                <p className="mt-1">
                  Match actions, movement, passing, defending, attacking,
                  decision-making and positional play.
                </p>
              </div>

              <div>
                <span className="font-bold text-white">Goalkeepers</span>
                <p className="mt-1">
                  Shot stopping, handling, distribution, crosses, 1v1s and
                  positioning.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
  <button
    type="button"
    onClick={() => {
      if (!registrationId) {
         setError(
            "Registration session not found. Please return to registration and continue again.",
         );
         return;
      }

      router.push(
        `/register/medical-consent?registration=${registrationId}`,
      );
    }}
    className="text-sm font-semibold text-white/45 transition hover:text-white"
  >
    Add video later
  </button>

 <button
  type="button"
  disabled={!registrationId || uploading}
  onClick={async () => {
    if (!registrationId) {
      setError(
        "Registration session not found. Please return to registration and continue again.",
      );
      return;
    }

    try {
      setUploading(true);
      setError("");

      if (videoFile) {
        await uploadDirectVideo();
      }

      router.push(
        `/register/medical-consent?registration=${registrationId}`,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save video.",
      );
    } finally {
      setUploading(false);
    }
  }}
  className="rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black disabled:cursor-not-allowed disabled:opacity-40"
>
  {uploading
    ? "Uploading..."
    : "Continue"}
</button>
</div>
        </div>

        <aside>
          <div className="sticky top-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/40">
              Video guidance
            </div>

            <div className="mt-5 text-lg font-black">
              Keep it football-focused
            </div>

            <ul className="mt-5 space-y-3 text-sm leading-6 text-white/55">
              <li>3–5 minutes is ideal.</li>
              <li>Make sure the player is easy to identify.</li>
              <li>Use recent footage where possible.</li>
              <li>Do not add unnecessary long introductions.</li>
              <li>One strong video is better than lots of short clips.</li>
            </ul>

            <div className="mt-6 rounded-xl border border-[#c7ff2f]/15 bg-[#c7ff2f]/[0.05] p-4 text-sm leading-6 text-white/60">
              Video upload is optional during checkout, but should be completed
              before player review for {activeEvent.edition}.
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default function VideoPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#090909] text-white">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <div className="text-sm text-white/45">
              Loading video details...
            </div>
          </div>
        </main>
      }
    >
      <VideoPageContent />
    </Suspense>
  );
}
