import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getAgeAtEvent } from "@/lib/registration/ageAtEvent";
import { updateMedicalConsent } from "../actions/updateMedicalConsent";

type MedicalPageProps = {
  searchParams: Promise<{
    registration?: string;
  }>;
};

export default async function MedicalPage({
  searchParams,
}: MedicalPageProps) {
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

  if (isUnder18AtEvent === null) {
    throw new Error(
      "Unable to determine the player's age at the event.",
    );
  }

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
            href={`/register/video?registration=${registration.id}`}
            className="text-sm font-medium text-white/60 transition hover:text-white"
          >
            Back
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1fr_340px] lg:px-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#c7ff2f]">
            Step 5 of 10
          </div>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            {isUnder18AtEvent
              ? "Medical & Guardian Consent"
              : "Medical"}
          </h1>

          <p className="mt-3 max-w-2xl text-white/55">
            {isUnder18AtEvent
              ? "Provide the player's medical information, emergency contact details and parent or guardian medical consent."
              : "Provide your medical information, emergency contact details and medical consent."}
          </p>

          <form
            action={updateMedicalConsent}
            className="mt-10 space-y-8"
          >
            <input
              type="hidden"
              name="registrationId"
              value={registration.id}
            />

            {/* MEDICAL INFORMATION */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <div className="text-lg font-black">
                Medical Information
              </div>

              <p className="mt-2 text-sm leading-6 text-white/45">
                Please tell us about any allergies, medical conditions,
                medication, previous injuries or other information the event
                medical team should know.
              </p>

              <textarea
                name="medicalNotes"
                rows={6}
                defaultValue={registration.medicalNotes ?? ""}
                placeholder="Enter relevant medical information, or write 'None'..."
                className="mt-5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none transition placeholder:text-white/20 focus:border-[#c7ff2f]/60"
              />
            </div>

            {/* EMERGENCY CONTACT */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <div className="text-lg font-black">
                Emergency Contact
              </div>

              <p className="mt-2 text-sm leading-6 text-white/45">
                Provide the details of the person ASCEND should contact in an
                emergency.
              </p>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold">
                    Emergency contact name
                  </span>

                  <input
                    name="emergencyContactName"
                    type="text"
                    required
                    defaultValue={registration.emergencyContactName ?? ""}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold">
                    Emergency contact phone
                  </span>

                  <input
                    name="emergencyContactPhone"
                    type="tel"
                    required
                    defaultValue={registration.emergencyContactPhone ?? ""}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
                  />
                </label>
              </div>
            </div>

            {/* MEDICAL CONSENT */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <div className="text-lg font-black">
                {isUnder18AtEvent
                  ? "Parent / Guardian Medical Consent"
                  : "Medical Consent"}
              </div>

              {isUnder18AtEvent && (
                <div className="mt-4 rounded-xl border border-[#c7ff2f]/20 bg-[#c7ff2f]/[0.05] p-4">
                  <div className="text-xs font-black uppercase tracking-[0.1em] text-[#c7ff2f]">
                    Parent / Guardian
                  </div>

                  <div className="mt-2 font-semibold">
                    {registration.guardianName}
                  </div>

                  <div className="mt-1 text-sm text-white/45">
                    {registration.guardianRelationship}
                  </div>
                </div>
              )}

              <label className="mt-5 flex gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
                <input
                  type="checkbox"
                  name="medicalConsent"
                  required
                  defaultChecked={registration.medicalConsent}
                  className="mt-1"
                />

                <span className="text-sm leading-6 text-white/60">
                  {isUnder18AtEvent
                    ? "I confirm that I am the parent or legal guardian of the player and consent to appropriate first aid and emergency medical assistance being provided if required during the event."
                    : "I consent to appropriate first aid and emergency medical assistance being provided if required during the event."}
                </span>
              </label>
            </div>

            <div className="flex justify-end">
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
              Player
            </div>

            <div className="mt-5 text-xl font-black">
              {registration.firstName} {registration.lastName}
            </div>

            <div className="mt-1 text-[#c7ff2f]">
              {registration.event.edition}
            </div>

            <div className="mt-6 space-y-4 border-t border-white/10 pt-6 text-sm">
              <div className="flex justify-between gap-6">
                <span className="text-white/40">
                  Age at event
                </span>

                <span>
                  {ageAtEvent !== null
                    ? `${ageAtEvent} ${
                        isUnder18AtEvent ? "(U18)" : "(18+)"
                      }`
                    : "Unavailable"}
                </span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-white/40">
                  Position
                </span>

                <span>{registration.primaryPosition}</span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-white/40">
                  Status
                </span>

                <span>DRAFT</span>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-[#c7ff2f]/15 bg-[#c7ff2f]/[0.05] p-4 text-sm leading-6 text-white/60">
              Medical information should be accurate and updated if anything
              changes before the Showcase.
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
