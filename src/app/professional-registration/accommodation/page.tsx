"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { updateProfessionalAccommodation } from "./actions/updateProfessionalAccommodation";

function AccommodationPageContent() {
  const searchParams = useSearchParams();

  const registrationId =
    searchParams.get("registration") || "";

  const [hotelStatus, setHotelStatus] = useState("");

const [professional, setProfessional] = useState<{
  id: string;
  fullName: string;
  role: string;
  email: string;
  phone: string;
  headshotUrl: string | null;

  arrivalTransfer: boolean;
  arrivalDate: string | null;
  arrivalTime: string | null;
  arrivalAirline: string | null;
  arrivalFlight: string | null;

  departureTransfer: boolean;
  departureDate: string | null;
  departureTime: string | null;
  departureAirline: string | null;
  departureFlight: string | null;
} | null>(null);

const [loadingProfessional, setLoadingProfessional] = useState(true);

useEffect(() => {
  async function loadProfessional() {
    if (!registrationId) {
      setLoadingProfessional(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/professional-registration/${registrationId}`,
      );

      if (!response.ok) {
        throw new Error("Unable to load registration.");
      }

      const data = await response.json();

      setProfessional(data);
    } catch (error) {
      console.error(
        "Unable to load professional registration:",
        error,
      );
    } finally {
      setLoadingProfessional(false);
    }
  }

  loadProfessional();
}, [registrationId]);

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
            href={`/professional-registration/travel?${searchParams.toString()}`}
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
            Accommodation information for your stay in Lagos.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
        <form
  action={updateProfessionalAccommodation}
  className="space-y-8"
>
  <input
    type="hidden"
    name="registrationId"
    value={registrationId}
  />

  <input
    type="hidden"
    name="hotelStatus"
    value={hotelStatus}
  />    

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 sm:p-10">
            <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
              Step 4
            </div>

            <h2 className="mt-3 text-2xl font-black">
              Accommodation
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/50">
              ASCEND has arranged a preferential discount rate for registered club
              representatives, scouts and football agents attending Lagos 2027.
            </p>

            <div className="mt-8 rounded-2xl border border-[#c7ff2f]/20 bg-[#c7ff2f]/[0.05] p-6">
              <div className="text-xs font-black uppercase tracking-[0.2em] text-[#c7ff2f]">
                ASCEND Preferred Hotel
              </div>

              <h3 className="mt-3 text-xl font-black">
                Lagos Continental Hotel
              </h3>

              <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-white/40">
                  ASCEND Discount Code
                </div>

                <div className="mt-2 text-xl font-black tracking-[0.08em] text-[#c7ff2f]">
                  Discount rate and booking code activation are awaiting hotel confirmation.
               </div>
              </div>

<a
  href="https://www.thelagoscontinental.com/"
  target="_blank"
  rel="noopener noreferrer"
  className="mt-5 inline-flex rounded-full bg-[#c7ff2f] px-6 py-3 text-xs font-black uppercase tracking-[0.1em] text-black transition hover:opacity-90"
>
  View Hotel
</a>
            </div>

            <div className="mt-8">
              <label className="space-y-2">
                <span className="text-sm font-semibold">
                  Are you staying at the ASCEND preferred hotel?
                </span>

                <select
                  required
                  value={hotelStatus}
                  onChange={(event) =>
                    setHotelStatus(event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
                >
                  <option value="">Select</option>
                  <option value="YES">Yes</option>
                  <option value="NO">No</option>
                  <option value="NOT_BOOKED">
                    Not booked yet
                  </option>
                </select>
              </label>
            </div>

            {hotelStatus === "NO" && (
              <div className="mt-6">
                <label className="space-y-2">
                  <span className="text-sm font-semibold">
                    Address in Lagos during the Showcase
                  </span>

                  <textarea
                    name="lagosAddress"
                    required
                    rows={4}
                    placeholder="Hotel name and address, apartment or other accommodation details"
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
                  />
                </label>

                <p className="mt-2 text-xs leading-5 text-white/35">
                  This information will be used for event logistics and,
                  where applicable, transport coordination.
                </p>
              </div>
            )}

            {hotelStatus === "NOT_BOOKED" && (
              <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/50">
                That&apos;s fine. You can confirm your accommodation details
                later before the Showcase.
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-white/35">
              Registration Summary
            </div>

          {/* Accreditation headshot */}
  {professional?.headshotUrl && (
    <div className="mt-6 border-b border-white/10 pb-6">
      <div className="text-sm text-white/35">
        Accreditation headshot
      </div>

      <div className="mt-3 flex items-center gap-5">
        <div className="h-32 w-32 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
          <img
            src={`/api/professional-registration/${professional.id}/headshot`}
            alt={`${professional.fullName} accreditation headshot`}
            className="h-full w-full object-cover"
          />
        </div>

        <div>
          <div className="font-bold text-white">
            {professional.fullName}
          </div>

          <div className="mt-1 text-sm uppercase tracking-[0.08em] text-[#c7ff2f]">
            {professional.role.replaceAll("_", " ")}
          </div>

          <div className="mt-2 text-xs text-white/35">
            This photograph will appear on your event accreditation.
          </div>
        </div>
      </div>
    </div>
  )}

            <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <div className="text-white/35">Name</div>
                <div className="mt-1 font-semibold">
                  {loadingProfessional
                     ? "Loading..."
                     : professional?.fullName || "Not provided"}
                </div>
              </div>

              <div>
                <div className="text-white/35">Role</div>
                <div className="mt-1 font-semibold">
                  {loadingProfessional
                    ? "Loading..."
                    : professional?.role.replaceAll("_", " ") || "Not provided"}
                </div>
              </div>

              <div>
                <div className="text-white/35">Email</div>
                <div className="mt-1 font-semibold">
                  {loadingProfessional
                    ? "Loading..."
                    : professional?.email || "Not provided"}
                </div>
              </div>

              <div>
                <div className="text-white/35">Mobile / WhatsApp</div>
                <div className="mt-1 font-semibold">
                  {loadingProfessional
                    ? "Loading..."
                    : professional?.phone || "Not provided"}
                </div>
              </div>

                <div>
                <div className="text-white/35">Airport collection</div>
                <div className="mt-1 font-semibold">
                  {professional
  ? professional.arrivalTransfer
    ? "YES"
    : "NO"
  : "Loading..."}
                </div>
              </div>

              <div>
                <div className="text-white/35">Departure transfer</div>
                <div className="mt-1 font-semibold">
                  {professional
  ? professional.departureTransfer
    ? "YES"
    : "NO"
  : "Loading..."}
                </div>
              </div>

              {professional?.arrivalTransfer && (
                <>
                  <div>
                    <div className="text-white/35">Arrival date</div>
                    <div className="mt-1 font-semibold"> 
                      {professional?.arrivalDate
                        ? new Date(professional.arrivalDate)
                          .toISOString()
                          .slice(0, 10)
                        : "Not provided"}
                    </div>
                  </div>

                  <div>
                    <div className="text-white/35">Arrival time</div>
                    <div className="mt-1 font-semibold">
                      {professional?.arrivalTime || "Not provided"}
                    </div>
                  </div>

                  <div>
                    <div className="text-white/35">Arrival airline</div>
                    <div className="mt-1 font-semibold">
                      {professional?.arrivalAirline || "Not provided"}
                    </div>
                  </div>

                  <div>
                    <div className="text-white/35">Arrival flight</div>
                    <div className="mt-1 font-semibold">
                      {professional?.arrivalFlight || "Not provided"}
                    </div>
                  </div>
                </>
              )}

              {professional?.departureTransfer && (
                <>
                  <div>
                    <div className="text-white/35">Departure date</div>
                    <div className="mt-1 font-semibold">
                      {professional?.departureDate
                        ? new Date(professional.departureDate)
                          .toISOString()
                          .slice(0, 10)
                        : "Not provided"}
                    </div>
                  </div>

                  <div>
                    <div className="text-white/35">Departure time</div>
                    <div className="mt-1 font-semibold">
                      {professional?.departureTime || "Not provided"}
                    </div>
                  </div>

                  <div>
                    <div className="text-white/35">Departure airline</div>
                    <div className="mt-1 font-semibold">
                      {professional?.departureAirline || "Not provided"}
                    </div>
                  </div>

                  <div>
                    <div className="text-white/35">Departure flight</div>
                    <div className="mt-1 font-semibold">
                      {professional?.departureFlight || "Not provided"}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              href={`/professional-registration/travel?registration=${registrationId}`}
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

export default function AccommodationPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#090909] text-white">
          <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
            <div className="text-sm text-white/45">
              Loading accommodation details...
            </div>
          </div>
        </main>
      }
    >
      <AccommodationPageContent />
    </Suspense>
  );
}
