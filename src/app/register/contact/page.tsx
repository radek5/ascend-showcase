import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateContact } from "../actions/updateContact";
import { getAgeAtEvent } from "@/lib/registration/ageAtEvent";

type ContactPageProps = {
  searchParams: Promise<{
    registration?: string;
  }>;
};

export default async function ContactPage({
  searchParams,
}: ContactPageProps) {
  const params = await searchParams;
  const registrationId = params.registration;

  if (!registrationId) {
    notFound();
  }

  const registration = await prisma.registration.findUnique({
    where: {
      id: registrationId,
    },
    include: {
      event: true,
    },
  });

  if (!registration) {
    notFound();
  }

const { ageAtEvent, isUnder18AtEvent } = getAgeAtEvent(
  registration.dateOfBirth,
  registration.event.footballStartsAt,
);

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
              <path
                d="M27 3 49 46 27 35 5 46 27 3Z"
                fill="#1685ff"
              />
              <path
                d="M27 15 38 37 27 31 16 37 27 15Z"
                fill="#020812"
              />
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
            Step 2 of 8
          </div>

      <h1 className="mt-3 text-3xl font-black sm:text-4xl">
         {isUnder18AtEvent === true ? "Contact & Guardian" : "Contact"}
      </h1>

      <p className="mt-3 max-w-2xl text-white/55">
        {isUnder18AtEvent === true
          ? "Add the player's contact details, parent or guardian information, and emergency contact."
          : "Add the player's contact details and emergency contact information."}
      </p>
          <form
            action={updateContact}
            className="mt-10 grid gap-6 sm:grid-cols-2"
          >
            <input
              type="hidden"
              name="registrationId"
              value={registration.id}
            />

{isUnder18AtEvent !== true && (
  <>
    <label className="space-y-2">
      <span className="text-sm font-semibold">Email</span>

      <input
        name="email"
        type="email"
        required
        defaultValue={registration.email ?? ""}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
      />
    </label>

    <label className="space-y-2">
      <span className="text-sm font-semibold">
        Phone / WhatsApp
      </span>

      <input
        name="phone"
        type="tel"
        required
        defaultValue={registration.phone ?? ""}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
      />
    </label>
  </>
)}

{isUnder18AtEvent === true && (
  <>
    <div className="sm:col-span-2 border-t border-white/10 pt-8">
      <div className="text-lg font-black">
        Parent / Guardian Contact
      </div>

      <p className="mt-2 text-sm text-white/45">
        Because the player will be under 18 at the start of the Showcase,
        all ASCEND communication will be through the parent or legal guardian.
      </p>
    </div>

    <label className="space-y-2">
      <span className="text-sm font-semibold">
        Guardian full name
      </span>

      <input
        name="guardianName"
        type="text"
        required
        defaultValue={registration.guardianName ?? ""}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
      />
    </label>

    <label className="space-y-2">
      <span className="text-sm font-semibold">
        Relationship
      </span>

      <input
        name="guardianRelationship"
        type="text"
        required
        placeholder="Parent, legal guardian..."
        defaultValue={registration.guardianRelationship ?? ""}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none transition placeholder:text-white/20 focus:border-[#c7ff2f]/60"
      />
    </label>

    <label className="space-y-2">
      <span className="text-sm font-semibold">
        Guardian email
      </span>

      <input
        name="guardianEmail"
        type="email"
        required
        defaultValue={registration.guardianEmail ?? ""}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
      />
    </label>

    <label className="space-y-2">
      <span className="text-sm font-semibold">
        Guardian phone / WhatsApp
      </span>

      <input
        name="guardianPhone"
        type="tel"
        required
        defaultValue={registration.guardianPhone ?? ""}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
      />
    </label>
  </>
)}

            <div className="mt-4 flex justify-end sm:col-span-2">
              <button
                type="submit"
                className="rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90"
              >
                Continue
              </button>
            </div>
          </form>
        </div>

        <aside>
          <div className="sticky top-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/40">
              Registration
            </div>

            <div className="mt-5 text-xl font-black">
              {registration.firstName} {registration.lastName}
            </div>

            <div className="mt-1 text-[#c7ff2f]">
              {registration.event.edition}
            </div>

            <div className="mt-6 space-y-4 border-t border-white/10 pt-6 text-sm">
              <div className="flex justify-between gap-6">
                <span className="text-white/40">Position</span>
                <span>{registration.primaryPosition}</span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-white/40">Venue</span>
                <span className="text-right">
                  {registration.event.venue}
                </span>
              </div>

              <div className="flex justify-between gap-6">
               <span className="text-white/40">Age at event</span>
               <span>
                 {ageAtEvent !== null
                   ? `${ageAtEvent} ${isUnder18AtEvent ? "(U18)" : "(18+)"}`
                   : "Pending event date"}
               </span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-white/40">Status</span>
                <span>DRAFT</span>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-[#c7ff2f]/15 bg-[#c7ff2f]/[0.05] p-4 text-sm leading-6 text-white/60">
              Your registration is saved as you move through each
              stage.
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
