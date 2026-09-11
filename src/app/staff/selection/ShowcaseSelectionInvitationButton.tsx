"use client";

import {
  useState,
  useTransition,
} from "react";

import { sendShowcaseSelectionInvitation } from "./sendShowcaseSelectionInvitation";

type Props = {
  applicationId: string;
  mode: "send" | "resend";
};

export default function ShowcaseSelectionInvitationButton({
  applicationId,
  mode,
}: Props) {
  const [isPending, startTransition] =
    useTransition();

  const [message, setMessage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  function handleClick() {
    if (isPending) {
      return;
    }

    setMessage(null);
    setError(null);

    startTransition(async () => {
      try {
        const result =
          await sendShowcaseSelectionInvitation(
            applicationId,
            mode === "resend",
          );

        if (result.alreadySent) {
          setMessage(
            "Invitation has already been sent.",
          );

          return;
        }

        setMessage(
          result.recipientEmail
            ? `Invitation sent to ${result.recipientEmail}`
            : "Invitation sent.",
        );
      } catch (err) {
        console.error(err);

        setError(
          "Invitation could not be sent. Please try again.",
        );
      }
    });
  }

  const isResend =
    mode === "resend";

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={
          isResend
            ? "text-[11px] font-black uppercase tracking-[0.05em] text-white/40 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            : "rounded-xl border border-[#c7ff2f]/30 px-3 py-2 text-[11px] font-black uppercase tracking-[0.05em] text-[#c7ff2f] transition hover:bg-[#c7ff2f]/10 disabled:cursor-not-allowed disabled:opacity-40"
        }
      >
        {isPending
          ? "Sending..."
          : isResend
            ? "Resend invitation"
            : "Send invitation"}
      </button>

      {message ? (
        <div className="mt-2 text-[11px] font-bold text-[#c7ff2f]">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="mt-2 text-[11px] font-bold text-red-400">
          {error}
        </div>
      ) : null}
    </div>
  );
}
