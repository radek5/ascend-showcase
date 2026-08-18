import Link from "next/link";
import { prisma } from "@/lib/prisma";

function formatDate(value: Date | null) {
  if (!value) return "Not provided";
  return value.toISOString().slice(0, 10);
}

export default async function ProfessionalReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ registration?: string }>;
}) {
  const { registration: registrationId } = await searchParams;

  if (!registrationId) {
    return (
      <main className="min-h-screen bg-[#090909] px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-black">
            Registration not found
          </h1>
        </div>
      </main>
    );
  }

  const registration =
    await prisma.professionalRegistration.findUnique({
      where: {
        id: registrationId,
      },
    });

  if (!registration) {
    return (
      <main className="min-h-screen bg-[#090909] px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-black">
            Registration not found
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <section className="border-b border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#c7ff2f]">
            Lagos 2027
          </div>

          <h1 className="mt-3 text-3xl font-black uppercase sm:text-4xl">
            Review & Submit
          </h1>

          <p className="mt-3 max-w-2xl text-white/55">
            Please check your professional registration details before submitting.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl space-y-8 px-6 py-16 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-white/35">
            Accreditation
          </div>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
            {registration.headshotUrl && (
              <div className="h-36 w-36 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                <img
                  src={`/api/professional-registration/${registration.id}/headshot`}
                  alt={`${registration.fullName} accreditation headshot`}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div>
              <div className="text-2xl font-black">
                {registration.fullName}
              </div>

              <div className="mt-2 text-sm font-bold uppercase tracking-[0.1em] text-[#c7ff2f]">
                {registration.role.replaceAll("_", " ")}
              </div>

              <div className="mt-3 text-sm text-white/50">
                This photograph will be used on your event accreditation.
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-white/35">
            Contact Details
          </div>

          <div className="mt-6 grid gap-6 text-sm sm:grid-cols-2">
            <div>
              <div className="text-white/35">Full name</div>
              <div className="mt-1 font-semibold">
                {registration.fullName}
              </div>
            </div>

            <div>
              <div className="text-white/35">Role</div>
              <div className="mt-1 font-semibold">
                {registration.role.replaceAll("_", " ")}
              </div>
            </div>

            <div>
              <div className="text-white/35">Email</div>
              <div className="mt-1 font-semibold">
                {registration.email}
              </div>
            </div>

            <div>
              <div className="text-white/35">Mobile / WhatsApp</div>
              <div className="mt-1 font-semibold">
                {registration.phone}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-white/35">
            Travel & Airport Transfer
          </div>

          <div className="mt-6 grid gap-6 text-sm sm:grid-cols-2">
            <div>
              <div className="text-white/35">Airport collection</div>
              <div className="mt-1 font-semibold">
                {registration.arrivalTransfer ? "YES" : "NO"}
              </div>
            </div>

            <div>
              <div className="text-white/35">Departure transfer</div>
              <div className="mt-1 font-semibold">
                {registration.departureTransfer ? "YES" : "NO"}
              </div>
            </div>

            {registration.arrivalTransfer && (
              <>
                <div>
                  <div className="text-white/35">Arrival date</div>
                  <div className="mt-1 font-semibold">
                    {formatDate(registration.arrivalDate)}
                  </div>
                </div>

                <div>
                  <div className="text-white/35">Arrival time</div>
                  <div className="mt-1 font-semibold">
                    {registration.arrivalTime || "Not provided"}
                  </div>
                </div>

                <div>
                  <div className="text-white/35">Arrival airline</div>
                  <div className="mt-1 font-semibold">
                    {registration.arrivalAirline || "Not provided"}
                  </div>
                </div>

                <div>
                  <div className="text-white/35">Arrival flight</div>
                  <div className="mt-1 font-semibold">
                    {registration.arrivalFlight || "Not provided"}
                  </div>
                </div>
              </>
            )}

            {registration.departureTransfer && (
              <>
                <div>
                  <div className="text-white/35">Departure date</div>
                  <div className="mt-1 font-semibold">
                    {formatDate(registration.departureDate)}
                  </div>
                </div>

                <div>
                  <div className="text-white/35">Departure time</div>
                  <div className="mt-1 font-semibold">
                    {registration.departureTime || "Not provided"}
                  </div>
                </div>

                <div>
                  <div className="text-white/35">Departure airline</div>
                  <div className="mt-1 font-semibold">
                    {registration.departureAirline || "Not provided"}
                  </div>
                </div>

                <div>
                  <div className="text-white/35">Departure flight</div>
                  <div className="mt-1 font-semibold">
                    {registration.departureFlight || "Not provided"}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-white/35">
            Accommodation
          </div>

          <div className="mt-6 grid gap-6 text-sm sm:grid-cols-2">
            <div>
              <div className="text-white/35">Preferred hotel</div>
              <div className="mt-1 font-semibold">
                Lagos Continental Hotel
              </div>
            </div>

            <div>
              <div className="text-white/35">
                Staying at preferred hotel
              </div>
              <div className="mt-1 font-semibold">
                {registration.hotelStatus === "YES"
                  ? "YES"
                  : registration.hotelStatus === "NO"
                    ? "NO"
                    : "NOT BOOKED YET"}
              </div>
            </div>

            {registration.hotelStatus === "NO" && (
              <div className="sm:col-span-2">
                <div className="text-white/35">
                  Address in Lagos
                </div>
                <div className="mt-1 font-semibold">
                  {registration.lagosAddress || "Not provided"}
                </div>
              </div>
            )}
          </div>
        </div>

        <form
          action={`/api/professional-registration/${registration.id}/submit`}
          method="post"
          className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8"
        >
          <div className="text-xs font-black uppercase tracking-[0.2em] text-white/35">
            Declarations
          </div>

          <label className="mt-6 flex items-start gap-3">
            <input
              type="checkbox"
              name="safeguardingConsent"
              required
              className="mt-1 h-4 w-4 accent-[#c7ff2f]"
            />

            <span className="text-sm leading-6 text-white/60">
              I agree to comply with the ASCEND Lagos 2027 Event Code of Conduct
              and Safeguarding Requirements.
            </span>
          </label>

          <label className="mt-5 flex items-start gap-3">
            <input
              type="checkbox"
              name="privacyConsent"
              required
              className="mt-1 h-4 w-4 accent-[#c7ff2f]"
            />

            <span className="text-sm leading-6 text-white/60">
              I have read the ASCEND Privacy Notice and understand that my
              information will be used for event accreditation, communications
              and event logistics.
            </span>
          </label>

          {/* FUTURE ASCEND COMMUNICATIONS — OPTIONAL */}

<div className="mt-6 rounded-2xl border border-[#1685ff]/20 bg-[#1685ff]/[0.05] p-5">
  <div className="text-xs font-black uppercase tracking-[0.15em] text-[#1685ff]">
    Future ASCEND Events & Opportunities
  </div>

  <label className="mt-4 flex items-start gap-3">
    <input
      type="checkbox"
      name="futureEventConsent"
      defaultChecked={registration.futureEventConsent}
      className="mt-1 h-4 w-4 accent-[#1685ff]"
    />

    <span className="text-sm leading-6 text-white/60">
      Keep me informed about future ASCEND Football Showcase events,
      scouting opportunities and relevant professional football
      activities.
      <span className="mt-2 block text-xs text-white/35">
        Optional. You can withdraw your consent at any time.
      </span>
    </span>
  </label>
</div>

          <div className="mt-8 flex items-center justify-between">
            <Link
              href={`/professional-registration/accommodation?registration=${registration.id}`}
              className="text-sm font-semibold text-white/50 transition hover:text-white"
            >
              ← Back
            </Link>

            <button
              type="submit"
              className="rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90"
            >
              Submit Registration
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
