"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { respondToShowcaseOffer } from "./actions";

type Props = {
  applicationId: string;
};

export default function OfferResponseButtons({ applicationId }: Props) {
  const router = useRouter();

  const [declineConfirming, setDeclineConfirming] = useState(false);
  const [submitting, setSubmitting] = useState<"ACCEPTED" | "DECLINED" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  async function respond(response: "ACCEPTED" | "DECLINED") {
    if (submitting) {
      return;
    }

    setSubmitting(response);
    setError(null);

    const formData = new FormData();

    formData.set("applicationId", applicationId);
    formData.set("response", response);

    try {
      await respondToShowcaseOffer(formData);

      setDeclineConfirming(false);
      router.refresh();
    } catch (responseError) {
      setError(
        responseError instanceof Error
          ? responseError.message
          : "Your response could not be recorded.",
      );
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div>
      {!declineConfirming ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={Boolean(submitting)}
            onClick={() => respond("ACCEPTED")}
            className="rounded-full bg-[#c7ff2f] px-7 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting === "ACCEPTED" ? "Accepting..." : "Accept My Place"}
          </button>

          <button
            type="button"
            disabled={Boolean(submitting)}
            onClick={() => {
              setDeclineConfirming(true);
              setError(null);
            }}
            className="rounded-full border border-white/15 px-7 py-4 text-sm font-black uppercase tracking-[0.08em] text-white/70 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Decline Place
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.04] p-5">
          <div className="font-black text-white">
            Are you sure you want to decline your place?
          </div>

          <p className="mt-2 text-sm leading-6 text-white/55">
            Declining releases your Lagos 2027 place. This response cannot be
            changed through your applicant account.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={Boolean(submitting)}
              onClick={() => respond("DECLINED")}
              className="rounded-full bg-red-400 px-5 py-3 text-xs font-black uppercase tracking-[0.06em] text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting === "DECLINED" ? "Declining..." : "Confirm Decline"}
            </button>

            <button
              type="button"
              disabled={Boolean(submitting)}
              onClick={() => setDeclineConfirming(false)}
              className="rounded-full border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-[0.06em] text-white/70 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Keep My Place
            </button>
          </div>
        </div>
      )}

      {error ? (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.05] px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}
    </div>
  );
}
