"use client";

import { useState } from "react";

import { releaseSelectionDecisions } from "./actions";

type Props = {
  eventSlug: string;
};

export default function ReleaseSelectionDecisionsButton({
  eventSlug,
}: Props) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-full bg-[#c7ff2f] px-6 py-3 text-xs font-black uppercase tracking-[0.06em] text-black"
      >
        Release Decisions
      </button>
    );
  }

  return (
    <div className="max-w-md rounded-2xl border border-[#c7ff2f]/30 bg-[#c7ff2f]/5 p-4">
      <div className="text-sm font-black text-white">
        Confirm decision release
      </div>

      <p className="mt-2 text-sm leading-6 text-white/50">
        This will make the current player outcomes official and close new
        applications for this event.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <form action={releaseSelectionDecisions}>
          <input
            type="hidden"
            name="eventSlug"
            value={eventSlug}
          />

          <button
            type="submit"
            className="rounded-full bg-[#c7ff2f] px-5 py-2.5 text-xs font-black uppercase tracking-[0.06em] text-black"
          >
            Confirm Release
          </button>
        </form>

        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-full border border-white/10 px-5 py-2.5 text-xs font-black uppercase tracking-[0.06em] text-white/70"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
