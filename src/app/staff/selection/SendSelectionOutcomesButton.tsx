"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { sendReleasedSelectionOutcomes } from "./actions";

type SendResult = Awaited<ReturnType<typeof sendReleasedSelectionOutcomes>>;

type Props = {
  eventSlug: string;
  pendingCount: number;
};

export default function SendSelectionOutcomesButton({
  eventSlug,
  pendingCount,
}: Props) {
  const router = useRouter();

  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (sending) {
      return;
    }

    setSending(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.set("eventSlug", eventSlug);

    try {
      const response = await sendReleasedSelectionOutcomes(formData);

      setResult(response);
      setConfirming(false);

      router.refresh();
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Outcome notifications could not be sent.",
      );
    } finally {
      setSending(false);
    }
  }

  if (pendingCount === 0) {
    return (
      <div className="rounded-2xl border border-[#c7ff2f]/20 bg-[#c7ff2f]/5 px-5 py-4">
        <div className="text-xs font-black uppercase tracking-[0.08em] text-[#c7ff2f]">
          Outcome Notifications Complete
        </div>

        <p className="mt-1 text-sm text-white/50">
          All released player outcomes have a recorded notification.
        </p>
      </div>
    );
  }

  return (
    <div>
      {!confirming ? (
        <button
          type="button"
          onClick={() => {
            setConfirming(true);
            setResult(null);
            setError(null);
          }}
          className="rounded-full bg-[#c7ff2f] px-6 py-3 text-xs font-black uppercase tracking-[0.06em] text-black"
        >
          Send Outcome Notifications
        </button>
      ) : (
        <div className="max-w-lg rounded-2xl border border-[#c7ff2f]/30 bg-[#c7ff2f]/5 p-4">
          <div className="text-sm font-black text-white">
            Confirm outcome delivery
          </div>

          <p className="mt-2 text-sm leading-6 text-white/50">
            This will send official selection outcomes to {pendingCount} player
            {pendingCount === 1 ? "" : "s"} who do not yet have a recorded
            outcome notification.
          </p>

          <p className="mt-2 text-xs leading-5 text-white/35">
            Selected players receive their offer notice only. Event QR
            credentials are not included in this notification.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="rounded-full bg-[#c7ff2f] px-5 py-2.5 text-xs font-black uppercase tracking-[0.06em] text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? "Sending..." : "Confirm Send"}
            </button>

            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={sending}
              className="rounded-full border border-white/10 px-5 py-2.5 text-xs font-black uppercase tracking-[0.06em] text-white/70 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {result ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-sm font-black text-white">
            Outcome delivery completed
          </div>

          <div className="mt-2 text-sm text-white/50">
            Sent: {result.sent} · Skipped: {result.skipped} · Failed:{" "}
            {result.failed}
          </div>

          {result.failures.length > 0 ? (
            <div className="mt-4 space-y-2">
              {result.failures.map((failure) => (
                <div
                  key={failure.applicationId}
                  className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3"
                >
                  <div className="text-xs font-black text-red-300">
                    {failure.registrationNumber || failure.applicationId}
                  </div>

                  <div className="mt-1 text-xs leading-5 text-white/45">
                    {failure.error}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}
    </div>
  );
}
