"use client";

import { useState, useTransition } from "react";

import { resendShowcaseConfirmation } from "./resendShowcaseConfirmation";

type Props = {
  applicationId: string;
  mode: "send" | "resend";
};

export default function ShowcaseConfirmationButton({
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
          await resendShowcaseConfirmation(
            applicationId,
          );

        setMessage(
          `Email sent to ${result.recipientEmail}`,
        );
      } catch (err) {
        console.error(err);

        setError(
          "Email could not be sent. Please try again.",
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
            : "rounded-xl border border-amber-300/30 px-3 py-2 text-[11px] font-black uppercase tracking-[0.05em] text-amber-200 transition hover:bg-amber-300/10 disabled:cursor-not-allowed disabled:opacity-40"
        }
      >
        {isPending
          ? "Sending..."
          : isResend
            ? "Resend"
            : "Send confirmation"}
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
