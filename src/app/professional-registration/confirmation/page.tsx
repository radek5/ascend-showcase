import Link from "next/link";

import { prisma } from "@/lib/prisma";
import ProfessionalRegistrationProgress from "@/components/professional-registration/ProfessionalRegistrationProgress";
import { checkProfessionalRegistrationAccess } from "@/lib/professionals/registrationOwnership";

export default async function ProfessionalConfirmationPage({
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

  const access =
    await checkProfessionalRegistrationAccess(
      registrationId,
    );

  if (!access.authorised) {
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
      where: { id: registrationId },
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

  const statusLabel = {
    DRAFT: "REGISTRATION IN PROGRESS",
    SUBMITTED: "SUBMITTED FOR REVIEW",
    UNDER_REVIEW: "UNDER REVIEW",
    APPROVED: "APPROVED — ACCREDITATION PENDING",
    MORE_INFO_REQUIRED: "MORE INFORMATION REQUIRED",
    REJECTED: "NOT APPROVED",
    ACCREDITED: "ACCREDITATION ISSUED",
    CHECKED_IN: "CHECKED IN",
  }[registration.status];

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <section className="border-b border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#c7ff2f]">
            Lagos 2027
          </div>

          <h1 className="mt-3 text-3xl font-black uppercase sm:text-4xl">
            Professional Registration
          </h1>

          <p className="mt-3 max-w-2xl text-white/55">
            Your professional registration status and next steps.
          </p>
        </div>
      </section>

      <ProfessionalRegistrationProgress currentStep={6} />

      <section className="mx-auto max-w-3xl px-6 py-20">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 sm:p-10">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#c7ff2f]">
            Step 6 of 6
          </div>

          <div className="mt-3 text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
            Registration Submitted
          </div>

          <h1 className="mt-4 text-3xl font-black uppercase">
            Thank You
          </h1>

          <p className="mt-4 text-lg text-white/70">
            Your professional registration for REVELATIONX1 Lagos 2027
            has been received.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-6">
            <div className="text-sm text-white/40">
              Name
            </div>

            <div className="mt-1 font-bold">
              {registration.fullName}
            </div>

            <div className="mt-5 text-sm text-white/40">
              Attending as
            </div>

            <div className="mt-1 font-bold uppercase">
              {registration.role.replaceAll("_", " ")}
            </div>

            <div className="mt-5 text-sm text-white/40">
              Status
            </div>

            <div className="mt-1 font-bold text-[#c7ff2f]">
              {statusLabel}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[#c7ff2f]/20 bg-[#c7ff2f]/[0.04] p-6">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-[#c7ff2f]">
              What Happens Next
            </div>

            <p className="mt-3 text-sm leading-6 text-white/60">
              The REVELATIONX1 team will review your professional
              registration before accreditation is approved. If your
              registration is approved, your professional accreditation,
              event credential and check-in information will be issued
              separately.
            </p>
          </div>

          <p className="mt-6 text-sm leading-6 text-white/45">
            Submission of a professional registration does not itself
            grant event accreditation or access to restricted event areas.
          </p>

          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex rounded-full bg-[#c7ff2f] px-7 py-4 text-sm font-black uppercase tracking-[0.08em] text-black"
            >
              Return to REVELATIONX1
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
