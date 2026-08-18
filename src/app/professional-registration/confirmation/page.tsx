import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ProfessionalConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ registration?: string }>;
}) {
  const { registration: registrationId } = await searchParams;

  const registration = registrationId
    ? await prisma.professionalRegistration.findUnique({
        where: { id: registrationId },
      })
    : null;

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
      <section className="mx-auto max-w-3xl px-6 py-20">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 sm:p-10">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
            Registration Confirmed
          </div>

          <h1 className="mt-4 text-3xl font-black uppercase">
            Thank You
          </h1>

          <p className="mt-4 text-lg text-white/70">
            Your professional registration for ASCEND Lagos 2027 is confirmed.
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
              PROFESSIONAL ACCREDITATION ISSUED
            </div>
          </div>

          <div className="mt-5 text-sm text-white/40">
             Accreditation number
          </div>

          <div className="mt-1 text-xl font-black text-[#c7ff2f]">
             {registration.accreditationNumber}
          </div>

          <p className="mt-8 text-sm leading-6 text-white/50">
             Your ASCEND Lagos 2027 professional accreditation has been confirmed.
             Your accreditation number, QR code and event information have been sent
             to your registered email address.
         </p>

          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex rounded-full bg-[#c7ff2f] px-7 py-4 text-sm font-black uppercase tracking-[0.08em] text-black"
            >
              Return to Event
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
