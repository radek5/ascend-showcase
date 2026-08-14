"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { activeEvent } from "@/data/event";
import { useSearchParams } from "next/navigation";
import { updateRepresentation } from "../actions/updateRepresentation";

function RepresentationPageContent() {
  const [hasAgent, setHasAgent] = useState<"yes" | "no" | "">("");

  const [ascendRepresentationInterest, setAscendRepresentationInterest] =
    useState<"yes" | "no" | "">("");

  const searchParams = useSearchParams();
  const registrationId = searchParams.get("registration");

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
            Step 3 of 8
          </div>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Representation
          </h1>

          <p className="mt-3 max-w-2xl text-white/55">
            Tell us whether the player is currently represented by a football
            agent or intermediary.
          </p>

          <form action={updateRepresentation}>
  <input
    type="hidden"
    name="registrationId"
    value={registrationId ?? ""}
  />

  <input
    type="hidden"
    name="hasAgent"
    value={hasAgent}
  />

  <input
  type="hidden"
  name="ascendRepresentationInterest"
  value={ascendRepresentationInterest}
/>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
           <div className="text-lg font-black">
              Are you currently represented?
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
             <button
  type="button"
  onClick={() => {
    setHasAgent("no");
    setAscendRepresentationInterest("");
  }}
  className={`rounded-2xl border p-5 text-left transition ${
    hasAgent === "no"
      ? "border-[#c7ff2f]/70 bg-[#c7ff2f]/[0.07]"
      : "border-white/10 bg-white/[0.02]"
  }`}
>
  <div className="font-black">No</div>
  <div className="mt-1 text-sm text-white/45">
    I am not currently represented.
  </div>
</button>

<button
  type="button"
  onClick={() => setHasAgent("yes")}
  className={`rounded-2xl border p-5 text-left transition ${
    hasAgent === "yes"
      ? "border-[#c7ff2f]/70 bg-[#c7ff2f]/[0.07]"
      : "border-white/10 bg-white/[0.02]"
  }`}
>
  <div className="font-black">Yes</div>
  <div className="mt-1 text-sm text-white/45">
    I currently have an agent or representative.
  </div>
</button>
            </div>
          </div>

{/* NO — ASCEND REPRESENTATION INTEREST */}
{hasAgent === "no" && (
  <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
    <div className="text-lg font-black">
      Would you like to be represented by ASCEND?
    </div>

    <p className="mt-2 text-sm leading-6 text-white/50">
      ASCEND provides professional football agent representation and
      career support for selected players.
    </p>

    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => setAscendRepresentationInterest("yes")}
        className={`rounded-2xl border p-5 text-left transition ${
          ascendRepresentationInterest === "yes"
            ? "border-[#c7ff2f]/70 bg-[#c7ff2f]/[0.07]"
            : "border-white/10 bg-white/[0.02]"
        }`}
      >
        <div className="font-black">Yes</div>
        <div className="mt-1 text-sm text-white/45">
          I would like ASCEND to contact me about representation.
        </div>
      </button>

      <button
        type="button"
        onClick={() => setAscendRepresentationInterest("no")}
        className={`rounded-2xl border p-5 text-left transition ${
          ascendRepresentationInterest === "no"
            ? "border-[#c7ff2f]/70 bg-[#c7ff2f]/[0.07]"
            : "border-white/10 bg-white/[0.02]"
        }`}
      >
        <div className="font-black">No</div>
        <div className="mt-1 text-sm text-white/45">
          I am not interested at this time.
        </div>
      </button>
    </div>

    <div className="mt-5 rounded-xl border border-[#c7ff2f]/15 bg-[#c7ff2f]/[0.05] p-4 text-xs leading-5 text-white/45">
      Selecting Yes is an expression of interest only and does not appoint
      ASCEND as your football agent. Any representation would be discussed
      and agreed separately.
    </div>
  </div>
)}

{/* YES — EXISTING AGENT DETAILS */}
          {hasAgent === "yes" && (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <div className="text-lg font-black">Agent Details</div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold">Agent full name</span>
                  <input
                    name="agentName"
                    type="text"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none focus:border-[#c7ff2f]/60"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold">Agency name</span>
                  <input
                    name="agencyName"
                    type="text"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none focus:border-[#c7ff2f]/60"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold">Agent email</span>
                  <input
                    name="agentEmail"
                    type="email"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none focus:border-[#c7ff2f]/60"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold">
                    Agent phone / WhatsApp
                  </span>
                  <input
                    name="agentPhone"
                    type="tel"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none focus:border-[#c7ff2f]/60"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold">Country</span>
                  <input
                    name="agentCountry"
                    type="text"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none focus:border-[#c7ff2f]/60"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold">
                    FIFA licence number
                  </span>
                  <input
                    name="fifaLicenceNumber"
                    type="text"
                    placeholder="If known"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none placeholder:text-white/20 focus:border-[#c7ff2f]/60"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold">
                    Representation start date
                  </span>
                  <input
                    name="representationStartDate"
                    type="date"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none focus:border-[#c7ff2f]/60"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold">
                    Representation end date
                  </span>
                  <input
                    name="representationEndDate"
                    type="date"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none focus:border-[#c7ff2f]/60"
                  />
                </label>

                <label className="space-y-2 sm:col-span-2">
                  <span className="text-sm font-semibold">
                    Is the representation exclusive?
                  </span>
                  <select
                    name="exclusive"
                    className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-4 outline-none focus:border-[#c7ff2f]/60"
                  >                   
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                    <option value="unknown">Not sure</option>
                  </select>
                </label>
              </div>

              <label className="mt-6 flex gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
                <input 
                  type="checkbox"
                  name="contactAuthorised" 
                  className="mt-1" 
                />
                <span className="text-sm leading-6 text-white/60">
                  I authorise ASCEND to contact this representative regarding
                  opportunities arising from the Showcase.
                </span>
              </label>
            </div>
          )}

          <label className="mt-8 flex gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <input 
               type="checkbox"
               name="declarationConfirmed"
               required 
               className="mt-1" 
            />

            <span className="text-sm leading-6 text-white/60">
              I confirm that the representation information provided is
              accurate to the best of my knowledge.
            </span>
          </label>

          <div className="mt-8 flex justify-end">

        <button
          type="submit"
          disabled={!hasAgent}
          className="rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
        </button>
        </div>
        
       </form>
          </div>

        <aside>
          <div className="sticky top-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/40">
              Why we ask
            </div>

            <div className="mt-5 text-lg font-black">
              Clear recruitment communication
            </div>

            <p className="mt-4 text-sm leading-6 text-white/55">
              Representation details help ASCEND understand who should be
              involved if a club or scout expresses genuine interest in a
              player.
            </p>

            <div className="mt-6 rounded-xl border border-[#c7ff2f]/15 bg-[#c7ff2f]/[0.05] p-4 text-sm leading-6 text-white/60">
              Guardian information for players under 18 remains separate from
              agent representation.
            </div>

            <div className="mt-6 border-t border-white/10 pt-6 text-sm text-white/40">
              {activeEvent.edition}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default function RepresentationPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#090909] text-white">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <div className="text-sm text-white/45">
              Loading representation details...
            </div>
          </div>
        </main>
      }
    >
      <RepresentationPageContent />
    </Suspense>
  );
}
