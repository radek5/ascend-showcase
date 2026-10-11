"use client";

import { useState } from "react";

type SelectorPlayVideoButtonProps = {
  assignmentId: string;
  videoId: string;
};

export default function SelectorPlayVideoButton({
  assignmentId,
  videoId,
}: SelectorPlayVideoButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePlay() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/selectors/assignments/${encodeURIComponent(
          assignmentId,
        )}/videos/${encodeURIComponent(videoId)}/play`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to open video.");
      }

      window.open(data.playbackUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to open video.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handlePlay}
        disabled={loading}
        className="rounded-full border border-[#c7ff2f]/30 bg-[#c7ff2f]/[0.06] px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-[#c7ff2f] transition hover:bg-[#c7ff2f]/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Opening..." : "Play Video"}
      </button>

      {error ? (
        <div className="mt-2 max-w-sm text-xs text-red-300">{error}</div>
      ) : null}
    </div>
  );
}
