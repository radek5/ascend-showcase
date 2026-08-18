"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { updateProfessionalTravel } from "./actions/updateProfessionalTravel";

function ProfessionalTravelPageContent() {
  const searchParams = useSearchParams();
 
  const registrationId =
    searchParams.get("registration") || "";

  const [arrivalTransfer, setArrivalTransfer] = useState("");
  const [departureTransfer, setDepartureTransfer] = useState("");

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link href="/" className="flex items-center gap-4">
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
            Tell us about your arrival and departure plans.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
<form
  action={updateProfessionalTravel}
  className="space-y-8"
>
  <input
    type="hidden"
    name="registrationId"
    value={registrationId}
  />

  <input
    type="hidden"
    name="arrivalTransfer"
    value={arrivalTransfer}
  />

  <input
    type="hidden"
    name="departureTransfer"
    value={departureTransfer}
  />
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 sm:p-10">
            <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
              Step 3
            </div>

            <h2 className="mt-3 text-2xl font-black">
              Arrival & Airport Transfer
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/50">
              Airport transfer arrangements will be available for registered
              football professionals attending Lagos 2027.
            </p>

            <div className="mt-8">
              <label className="space-y-2">
                <span className="text-sm font-semibold">
                  Do you require airport transfer?
                </span>

                <select
                  required
                  value={arrivalTransfer}
                  onChange={(event) =>
                    setArrivalTransfer(event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
                >
                  <option value="">Select</option>
                  <option value="YES">Yes</option>
                  <option value="NO">No</option>
                </select>
              </label>
            </div>

            {arrivalTransfer === "YES" && (
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold">Arrival date</span>
                  <input
                    name="arrivalDate"
                    type="date"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold">Arrival time</span>
                  <input
                    name="arrivalTime"
                    type="time"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold">Airline</span>
                  <input
                    name="arrivalAirline"
                    type="text"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold">Flight number</span>
                  <input
                    name="arrivalFlight"
                    type="text"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 sm:p-10">
            <h2 className="text-2xl font-black">
              Departure & Airport Transfer
            </h2>

            <div className="mt-6">
              <label className="space-y-2">
                <span className="text-sm font-semibold">
                  Do you require airport transfer?
                </span>

                <select
                  required
                  value={departureTransfer}
                  onChange={(event) =>
                    setDepartureTransfer(event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
                >
                  <option value="">Select</option>
                  <option value="YES">Yes</option>
                  <option value="NO">No</option>
                </select>
              </label>
            </div>

            {departureTransfer === "YES" && (
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold">Departure date</span>
                  <input
                    name="departureDate"
                    type="date"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold">Departure time</span>
                  <input
                    name="departureTime"
                    type="time"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold">Airline</span>
                  <input
                    name="departureAirline"
                    type="text"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold">Flight number</span>
                  <input
                    name="departureFlight"
                    type="text"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
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
      </section>
    </main>
  );
}

export default function ProfessionalTravelPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#090909] text-white">
          <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
            <div className="text-sm text-white/45">
              Loading travel details...
            </div>
          </div>
        </main>
      }
    >
      <ProfessionalTravelPageContent />
    </Suspense>
  );
}
