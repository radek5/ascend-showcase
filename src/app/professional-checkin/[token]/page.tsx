import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getCurrentStaffUser } from "@/lib/staff/auth";

export default async function ProfessionalCheckInPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const [registration, staffUser] = await Promise.all([
    prisma.professionalRegistration.findUnique({
      where: {
        checkInToken: token,
      },
    }),

    getCurrentStaffUser(),
  ]);

  if (!registration) {
    return (
      <main className="min-h-screen bg-[#090909] px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[2rem] border border-red-500/20 bg-red-500/[0.05] p-8">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-red-400">
              Invalid Accreditation
            </div>

            <h1 className="mt-4 text-3xl font-black">
              Accreditation Not Found
            </h1>

            <p className="mt-4 text-white/55">
              This professional accreditation QR code is invalid or no longer
              available.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const checkedInByStaff = 
    registration.checkedInByStaffUserId 
      ? await prisma.staffUser.findUnique({ 
         where: { 
           id: registration.checkedInByStaffUserId, 
         }, 
         select: { 
           name: true, 
           role: true, 
         }, 
       }) 
      : null;
 
  const isAccredited =
    registration.status === "ACCREDITED" ||
    registration.status === "CHECKED_IN";

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <section className="border-b border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
          <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#c7ff2f]">
            ASCEND Lagos 2027
          </div>

          <h1 className="mt-3 text-3xl font-black uppercase sm:text-4xl">
            Professional Accreditation
          </h1>

          <p className="mt-3 text-white/50">
            Event access credential and professional check-in.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
          {/* HEADSHOT */}
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-white/35">
              Accreditation Photo
            </div>

            <div className="mt-5 aspect-square overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/30">
              {registration.headshotUrl ? (
                <img
                  src={`/api/professional-registration/${registration.id}/headshot`}
                  alt={`${registration.fullName} accreditation headshot`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/30">
                  No headshot available
                </div>
              )}
            </div>

            <div className="mt-5 text-xs leading-5 text-white/35">
              ASCEND staff should confirm that the attendee matches this
              photograph before completing check-in.
            </div>
          </div>

          {/* ACCREDITATION DETAILS */}
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-[#c7ff2f]">
              Professional Accreditation
            </div>

            <h2 className="mt-4 text-3xl font-black">
              {registration.fullName}
            </h2>

            <div className="mt-2 text-sm font-bold uppercase tracking-[0.1em] text-[#c7ff2f]">
              {registration.role.replaceAll("_", " ")}
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <div className="text-sm text-white/35">
                  Accreditation number
                </div>

                <div className="mt-1 text-lg font-black">
                  {registration.accreditationNumber || "Not issued"}
                </div>
              </div>

              <div>
                <div className="text-sm text-white/35">
                  Accreditation status
                </div>

                <div
                  className={`mt-1 text-lg font-black ${
                    isAccredited
                      ? "text-[#c7ff2f]"
                      : "text-red-400"
                  }`}
                >
                  {registration.status.replaceAll("_", " ")}
                </div>
              </div>
            </div>

           {/* ALREADY CHECKED IN */}
{registration.checkedInAt ? (
  <div className="mt-8 rounded-2xl border border-[#c7ff2f]/20 bg-[#c7ff2f]/[0.06] p-6">
    <div className="text-xs font-black uppercase tracking-[0.18em] text-[#c7ff2f]">
      Already Checked In
    </div>

    <div className="mt-2 font-bold">
      Professional event access confirmed.
    </div>

    <div className="mt-2 text-sm text-white/45">
      {new Intl.DateTimeFormat("en-GB", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: "Africa/Lagos",
      }).format(registration.checkedInAt)}
    </div>

    {checkedInByStaff && (
      <div className="mt-3 text-sm text-white/45">
        Checked in by{" "}
        <span className="font-semibold text-white">
          {checkedInByStaff.name}
        </span>
        {" · "}
        {checkedInByStaff.role}
      </div>
    )}

   <Link
      href={`/professional-checkin/${token}/badge`}
      className="mt-6 inline-flex rounded-full bg-[#c7ff2f] px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90"
    >
      Print Badge
    </Link>

  </div>
) : !isAccredited ? (
  /* INVALID STATUS */
  <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/[0.05] p-6">
    <div className="text-xs font-black uppercase tracking-[0.18em] text-red-400">
      Access Not Valid
    </div>

    <p className="mt-2 text-sm leading-6 text-white/55">
      This registration is not currently accredited for professional
      event access.
    </p>
  </div>
) : staffUser ? (
  /* AUTHENTICATED STAFF */
  <div className="mt-8">
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-[#c7ff2f]">
        Staff Verification
      </div>

      <div className="mt-3 text-sm text-white/55">
        Signed in as:
      </div>

      <div className="mt-1 font-bold">
        {staffUser.name}
      </div>

      <p className="mt-4 text-sm leading-6 text-white/45">
        Confirm that the person presenting this accreditation
        matches the photograph before completing check-in.
      </p>
    </div>

    <form
      action={`/api/professional-checkin/${token}`}
      method="post"
    >
      <button
        type="submit"
        className="mt-6 w-full rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90"
      >
        Confirm Check-In
      </button>
    </form>
  </div>
) : (
  /* NOT LOGGED IN */
  <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-6">
    <div className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
      ASCEND Staff
    </div>

    <p className="mt-3 text-sm leading-6 text-white/55">
      This accreditation is valid. Only authorised ASCEND staff can
      complete event check-in.
    </p>

    <Link
      href="/staff/login"
      className="mt-5 inline-flex rounded-full border border-white/15 px-6 py-3 text-xs font-black uppercase tracking-[0.1em] text-white transition hover:border-[#c7ff2f]/50"
    >
      Staff Login
    </Link>
  </div>
)}

          </div>
        </div>
      </section>
    </main>
  );
}
