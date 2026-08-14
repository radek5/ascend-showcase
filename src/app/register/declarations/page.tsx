import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getAgeAtEvent } from "@/lib/registration/ageAtEvent";
import { updateDeclarations } from "../actions/updateDeclarations";

type DeclarationsPageProps = {
  searchParams: Promise<{
    registration?: string;
  }>;
};

export default async function DeclarationsPage({
  searchParams,
}: DeclarationsPageProps) {
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
      "Unable to determine player age at event.",
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
            href={`/register/medical-consent?registration=${registration.id}`}
            className="text-sm font-medium text-white/60 transition hover:text-white"
          >
            Back
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1fr_340px] lg:px-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#c7ff2f]">
            Step 6 of 10
          </div>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Consent & Declarations
          </h1>

          <p className="mt-3 max-w-2xl text-white/55">
            {isUnder18AtEvent
              ? "The parent or legal guardian must review and accept these declarations on behalf of the player."
              : "Please review and accept the declarations required to participate in the ASCEND Football Showcase."}
          </p>

          {isUnder18AtEvent && (
            <div className="mt-8 rounded-2xl border border-[#c7ff2f]/20 bg-[#c7ff2f]/[0.05] p-5">
              <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
                Parent / Guardian
              </div>

              <div className="mt-2 text-lg font-bold">
                {registration.guardianName}
              </div>

              <div className="mt-1 text-sm text-white/45">
                {registration.guardianRelationship}
              </div>

              <p className="mt-4 text-sm leading-6 text-white/60">
                These declarations are being made on behalf of{" "}
                {registration.firstName} {registration.lastName}.
              </p>
            </div>
          )}

          <form
            action={updateDeclarations}
            className="mt-10 space-y-5"
          >
            <input
              type="hidden"
              name="registrationId"
              value={registration.id}
            />

            <label className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <input
                name="eventConsent"
                type="checkbox"
                required
                defaultChecked={registration.eventConsent}
                className="mt-1"
              />

              <div>
                <div className="font-bold">
                  Participation Declaration
                </div>

<p className="mt-2 text-sm leading-6 text-white/55">
            {isUnder18AtEvent ? (
  <>
    I give permission for{" "}
    <span className="text-white">
      {registration.firstName} {registration.lastName}
    </span>{" "}
    to participate in the ASCEND Football Showcase and acknowledge that
    football involves physical activity and an inherent risk of injury.
  </>
) : (
  <>
    I agree to participate in the ASCEND Football Showcase and acknowledge
    that football involves physical activity and an inherent risk of injury.
  </>
)}
</p>
              </div>
            </label>

            <label className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <input
                name="declarationConsent"
                type="checkbox"
                required
                defaultChecked={registration.declarationConsent}
                className="mt-1"
              />

              <div>
                <div className="font-bold">
                  Accuracy Declaration
                </div>

                <p className="mt-2 text-sm leading-6 text-white/55">
                  I confirm that the information provided during this
                  registration, including player, representation and medical
                  information, is accurate to the best of my knowledge.
                </p>
              </div>
            </label>

            <label className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <input
                name="termsConsent"
                type="checkbox"
                required
                defaultChecked={registration.termsConsent}
                className="mt-1"
              />

              <div>
                <div className="font-bold">
                  Terms & Conditions
                </div>

                <p className="mt-2 text-sm leading-6 text-white/55">
                  I confirm that I have read and agree to the{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="font-bold text-[#c7ff2f] underline underline-offset-4"
                  >
                    ASCEND Football Showcase Terms & Conditions
                  </Link>
                  .
                </p>
              </div>
            </label>

            <label className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <input
                name="privacyConsent"
                type="checkbox"
                required
                defaultChecked={registration.privacyConsent}
                className="mt-1"
              />

              <div>
                <div className="font-bold">
                  Privacy Notice
                </div>

                <p className="mt-2 text-sm leading-6 text-white/55">
                  I confirm that I have read and understood the{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="font-bold text-[#c7ff2f] underline underline-offset-4"
                  >
                    ASCEND Football Showcase Privacy Notice
                  </Link>
                  , which explains how ASCEND processes player information,
                  including personal details, football information, photographs
                  and video.
                </p>
              </div>
            </label>

<label className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
  <input
    name="playerAgreementConsent"
    type="checkbox"
    required
    defaultChecked={registration.playerAgreementConsent}
    className="mt-1"
  />

  <div>
    <div className="font-bold">
      Player Agreement
    </div>

    <p className="mt-2 text-sm leading-6 text-white/55">
      I confirm that I have read and agree to the{" "}
      <Link
        href="/player-agreement"
        target="_blank"
        className="font-bold text-[#c7ff2f] underline underline-offset-4"
      >
        ASCEND Football Showcase Player Agreement
      </Link>
      .
    </p>
  </div>
</label>

            <div className="flex justify-end pt-4">
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

              {isUnder18AtEvent && (
                <div className="flex justify-between gap-6">
                  <span className="text-white/40">
                    Consent by
                  </span>

                  <span className="text-right">
                    Parent / Guardian
                  </span>
                </div>
              )}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
