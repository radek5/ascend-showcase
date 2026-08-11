"use client";

import { useState } from "react";

export default function HeadshotUpload() {
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <div className="sm:col-span-2">
      <div className="mb-3">
        <div className="text-sm font-semibold">
          Player headshot
        </div>

        <p className="mt-1 text-sm text-white/45">
          Upload a clear, recent head-and-shoulders photo. JPG, PNG or WebP
        </p>
      </div>

      <div className="grid gap-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:grid-cols-[160px_1fr]">
        <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/30">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-cover"
            />
          ) : (
        <span className="px-4 text-center text-xs uppercase tracking-[0.14em] text-white/30">
           Headshot Preview
        </span>
          )}
        </div>

          <div>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#c7ff2f] px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90">
              Upload Player Headshot

              <input
                name="headshot"
                type="file"
                accept="image/*"
                required
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (!file) {
                    setFileName("");
                    setPreview(null);
                    return;
                  }

                  setFileName(file.name);

                  const reader = new FileReader();

                  reader.onload = () => {
                    setPreview(String(reader.result));
                  };

                  reader.readAsDataURL(file);
                }}
              />
            </label>

            {fileName ? (
              <div className="mt-3 text-xs font-bold text-[#c7ff2f]">
                ✓ Selected: {fileName}
              </div>
            ) : (
              <div className="mt-3 text-xs text-white/35">
                No photo selected
              </div>
            )}
            <p className="mt-4 max-w-xl text-xs leading-5 text-white/35">
              Please use a recent head-and-shoulders photo with the player facing the
              camera. Avoid group photos, sunglasses, filters or full-body
              images.
            </p>
          </div>
      </div>
    </div>
  );
}
