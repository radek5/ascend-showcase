"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { createProfessionalRegistration } from "./actions/createProfessionalRegistration";

function ProfessionalDetailsPageContent() {
  const searchParams = useSearchParams();

  const role = searchParams.get("role") || "";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

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
            href="/professional-registration"
            className="text-sm font-medium text-white/60 transition hover:text-white"
          >
            Back
          </Link>
        </div>
      </header>

      <section className="border-b border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#c7ff2f]">
            Lagos 2027
          </div>

          <h1 className="mt-3 text-3xl font-black uppercase sm:text-4xl">
            Professional Registration
          </h1>

          <p className="mt-3 max-w-2xl text-white/55">
            Complete your contact and accreditation details.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 sm:p-10">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
            Step 2
          </div>

          <h2 className="mt-3 text-2xl font-black">
            Contact & Accreditation Details
          </h2>

          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/60">
            Attending as:{" "}
            <span className="font-bold text-white">
              {role.replaceAll("_", " ")}
            </span>
          </div>

          <p className="mt-3 text-sm text-white/45">
            Your headshot will appear on your event accreditation.
          </p>

          <form
            action={createProfessionalRegistration}
            className="mt-8 grid gap-6"
          >
            <input
              type="hidden"
              name="role"
              value={role}
            />

            <label className="space-y-2">
              <span className="text-sm font-semibold">Full name</span>

              <input
                name="fullName"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold">
                Email address
              </span>

              <input
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold">
                Mobile / WhatsApp number
              </span>

              <input
                name="phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
              />
            </label>

            <div className="space-y-3">
              <span className="text-sm font-semibold">
                Headshot photo
              </span>

              <div className="grid gap-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:grid-cols-[160px_1fr]">
                <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Headshot preview"
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
                    Upload Headshot

                    <input
                      name="headshot"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
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
                    Upload a recent head-and-shoulders photograph with your face
                    clearly visible. JPG, PNG or WebP. Maximum size 5MB.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Link
                href="/professional-registration"
                className="text-sm font-semibold text-white/50 transition hover:text-white"
              >
                ← Back
              </Link>

              <button
                type="submit"
                className="rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90"
              >
                Continue
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

export default function ProfessionalDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#090909] text-white">
          <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
            <div className="text-sm text-white/45">
              Loading registration details...
            </div>
          </div>
        </main>
      }
    >
      <ProfessionalDetailsPageContent />
    </Suspense>
  );
}
