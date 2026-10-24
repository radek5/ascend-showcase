"use client";

import { useState } from "react";
import { generatePreSelectedInvitation } from "./actions";

type Props = {
  playerId: string;
  whatsappNumber: string;
};

export default function GenerateWhatsAppInvitationButton({
  playerId,
  whatsappNumber,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");

  async function handleGenerate() {
    if (loading) return;

    setLoading(true);
    setError("");

    // Open a tab immediately to avoid popup blocking after the server call.
    const whatsappTab = window.open("about:blank", "_blank");

    try {
      const formData = new FormData();
      formData.set("playerId", playerId);
      formData.set("whatsappNumber", whatsappNumber);

      const whatsappUrl = await generatePreSelectedInvitation(formData);
      setGeneratedUrl(whatsappUrl);

      if (whatsappTab && !whatsappTab.closed) {
        whatsappTab.location.href = whatsappUrl;
      } else {
        window.location.assign(whatsappUrl);
      }
    } catch (err) {
      whatsappTab?.close();
      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate invitation.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="rounded-lg bg-[#c7ff2f] px-3 py-2 text-xs font-black text-black transition hover:bg-white disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate WhatsApp Link"}
      </button>

      {generatedUrl && (
        <div className="mt-2 flex flex-col gap-2">
          <a
            href={generatedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-[#c7ff2f] underline"
          >
            Open WhatsApp
          </a>
          <button
            type="button"
            onClick={async () => {
              try {
                const message = new URL(generatedUrl).searchParams.get("text");
                const invitationUrl = message?.split(" ").find((part) => part.startsWith("https://") || part.startsWith("http://"));
                if (!invitationUrl) throw new Error("Invitation link missing.");
                await navigator.clipboard.writeText(invitationUrl);
              } catch {
                setError("Unable to copy invitation link.");
              }
            }}
            className="text-left text-xs font-bold text-white/70 underline"
          >
            Copy Invitation Link
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
