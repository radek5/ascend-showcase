import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

function formatDate(value: Date | null) {
  if (!value) return "Not provided";

  return value.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: Date | null) {
  if (!value) return "Not recorded";

  return value.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function yesNo(value: boolean) {
  return value ? "Yes" : "No";
}

function displayStatus(value: string) {
  return value.replaceAll("_", " ");
}

export default async function ProfessionalReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaffUser();

  const { id } = await params;

  const registration =
    await prisma.professionalRegistration.findUnique({
      where: {
        id,
      },
    });

  if (!registration) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <section className="border-b border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <Link
            href="/staff/professionals"
            className="text-sm font-semibold text-white/45 transition hover:text-white"
          >
            ← Professional Attendees
          </Link>

          <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#c7ff2f]">
                Lagos 2027 · Professional Review
              </div>

              <h1 className="mt-3 text-3xl font-black uppercase sm:text-4xl">
                {registration.fullName}
              </h1>

              <div className="mt-3 text-sm font-bold uppercase tracking-[0.12em] text-white/50">
                {displayStatus(registration.role)}
              </div>
            </div>

            <div className="rounded-full border border-[#c7ff2f]/25 bg-[#c7ff2f]/[0.06] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
              {displayStatus(registration.status)}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-6 py-10 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside>
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                Accreditation Identity
              </div>

              <div className="mt-5 aspect-square overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                {registration.headshotUrl ? (
                  <img
                    src={`/api/professional-registration/${registration.id}/headshot`}
                    alt={`${registration.fullName} accreditation headshot`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center text-xs uppercase tracking-[0.12em] text-white/25">
                    No headshot available
                  </div>
                )}
              </div>

              <div className="mt-5">
                <div className="text-lg font-black">
                  {registration.fullName}
                </div>

                <div className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-[#c7ff2f]">
                  {displayStatus(registration.role)}
                </div>
              </div>

              <div className="mt-6 border-t border-white/10 pt-5">
                <div className="text-xs text-white/35">
                  Accreditation number
                </div>

                <div className="mt-1 break-words text-sm font-bold">
                  {registration.accreditationNumber || "Not issued"}
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs text-white/35">
                  Credential
                </div>

                <div className="mt-1 text-sm font-bold">
                  {registration.checkInToken
                    ? "Issued"
                    : "Not issued"}
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-8">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
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
                    {displayStatus(registration.role)}
                  </div>
                </div>

                <div>
                  <div className="text-white/35">Email</div>
                  <div className="mt-1 break-words font-semibold">
                    {registration.email}
                  </div>
                </div>

                <div>
                  <div className="text-white/35">
                    Mobile / WhatsApp
                  </div>
                  <div className="mt-1 font-semibold">
                    {registration.phone}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                Travel & Airport Transfer
              </div>

              <div className="mt-6 grid gap-6 text-sm sm:grid-cols-2">
                <div>
                  <div className="text-white/35">
                    Airport collection required
                  </div>
                  <div className="mt-1 font-semibold">
                    {yesNo(registration.arrivalTransfer)}
                  </div>
                </div>

                <div>
                  <div className="text-white/35">
                    Departure transfer required
                  </div>
                  <div className="mt-1 font-semibold">
                    {yesNo(registration.departureTransfer)}
                  </div>
                </div>

                {registration.arrivalTransfer ? (
                  <>
                    <div>
                      <div className="text-white/35">
                        Arrival date
                      </div>
                      <div className="mt-1 font-semibold">
                        {formatDate(registration.arrivalDate)}
                      </div>
                    </div>

                    <div>
                      <div className="text-white/35">
                        Arrival time
                      </div>
                      <div className="mt-1 font-semibold">
                        {registration.arrivalTime ||
                          "Not provided"}
                      </div>
                    </div>

                    <div>
                      <div className="text-white/35">
                        Arrival airline
                      </div>
                      <div className="mt-1 font-semibold">
                        {registration.arrivalAirline ||
                          "Not provided"}
                      </div>
                    </div>

                    <div>
                      <div className="text-white/35">
                        Arrival flight
                      </div>
                      <div className="mt-1 font-semibold">
                        {registration.arrivalFlight ||
                          "Not provided"}
                      </div>
                    </div>
                  </>
                ) : null}

                {registration.departureTransfer ? (
                  <>
                    <div>
                      <div className="text-white/35">
                        Departure date
                      </div>
                      <div className="mt-1 font-semibold">
                        {formatDate(registration.departureDate)}
                      </div>
                    </div>

                    <div>
                      <div className="text-white/35">
                        Departure time
                      </div>
                      <div className="mt-1 font-semibold">
                        {registration.departureTime ||
                          "Not provided"}
                      </div>
                    </div>

                    <div>
                      <div className="text-white/35">
                        Departure airline
                      </div>
                      <div className="mt-1 font-semibold">
                        {registration.departureAirline ||
                          "Not provided"}
                      </div>
                    </div>

                    <div>
                      <div className="text-white/35">
                        Departure flight
                      </div>
                      <div className="mt-1 font-semibold">
                        {registration.departureFlight ||
                          "Not provided"}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                Accommodation
              </div>

              <div className="mt-6 grid gap-6 text-sm sm:grid-cols-2">
                <div>
                  <div className="text-white/35">
                    Preferred hotel
                  </div>
                  <div className="mt-1 font-semibold">
                    Lagos Continental Hotel
                  </div>
                </div>

                <div>
                  <div className="text-white/35">
                    Accommodation status
                  </div>
                  <div className="mt-1 font-semibold">
                    {registration.hotelStatus ? displayStatus(registration.hotelStatus) : "Not provided"}
                  </div>
                </div>

                {registration.hotelStatus === "NO" ? (
                  <div className="sm:col-span-2">
                    <div className="text-white/35">
                      Address in Lagos
                    </div>
                    <div className="mt-1 whitespace-pre-wrap font-semibold">
                      {registration.lagosAddress ||
                        "Not provided"}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                Declarations & Consent
              </div>

              <div className="mt-6 grid gap-6 text-sm sm:grid-cols-2">
                <div>
                  <div className="text-white/35">
                    Safeguarding requirements
                  </div>
                  <div className="mt-1 font-semibold">
                    {registration.safeguardingConsent
                      ? "Accepted"
                      : "Not accepted"}
                  </div>
                </div>

                <div>
                  <div className="text-white/35">
                    Privacy notice
                  </div>
                  <div className="mt-1 font-semibold">
                    {registration.privacyConsent
                      ? "Accepted"
                      : "Not accepted"}
                  </div>
                </div>

                <div>
                  <div className="text-white/35">
                    Future event communications
                  </div>
                  <div className="mt-1 font-semibold">
                    {registration.futureEventConsent
                      ? "Opted in"
                      : "Not opted in"}
                  </div>
                </div>

                <div>
                  <div className="text-white/35">
                    Future consent recorded
                  </div>
                  <div className="mt-1 font-semibold">
                    {formatDateTime(
                      registration.futureEventConsentAt,
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                Registration Lifecycle
              </div>

              <div className="mt-6 grid gap-6 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <div className="text-white/35">Status</div>
                  <div className="mt-1 font-semibold">
                    {displayStatus(registration.status)}
                  </div>
                </div>

                <div>
                  <div className="text-white/35">
                    Submitted
                  </div>
                  <div className="mt-1 font-semibold">
                    {formatDateTime(registration.submittedAt)}
                  </div>
                </div>

                <div>
                  <div className="text-white/35">
                    Approved
                  </div>
                  <div className="mt-1 font-semibold">
                    {formatDateTime(registration.approvedAt)}
                  </div>
                </div>

                <div>
                  <div className="text-white/35">
                    Rejected
                  </div>
                  <div className="mt-1 font-semibold">
                    {formatDateTime(registration.rejectedAt)}
                  </div>
                </div>

                <div>
                  <div className="text-white/35">
                    Accreditation email
                  </div>
                  <div className="mt-1 font-semibold">
                    {formatDateTime(
                      registration.approvalEmailSentAt,
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-white/35">
                    Checked in
                  </div>
                  <div className="mt-1 font-semibold">
                    {formatDateTime(registration.checkedInAt)}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#c7ff2f]/20 bg-[#c7ff2f]/[0.04] p-6 sm:p-8">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-[#c7ff2f]">
                Staff Review
              </div>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">
                This record is currently read-only. Professional
                approval, accreditation issuance and other lifecycle
                decisions will be added as controlled staff actions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
