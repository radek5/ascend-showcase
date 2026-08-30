import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  updateShowcaseConsent,
} from "./actions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function calculateAge(
  dateOfBirth: Date | null
) {
  if (!dateOfBirth) {
    return null;
  }

  /*
   * Lagos 2027 currently uses January 2027.
   * We can later derive the exact assessment
   * date from Event once ShowcaseApplication
   * has a direct Event relation.
   */
  const eventDate =
    new Date("2027-01-01T00:00:00Z");

  let age =
    eventDate.getUTCFullYear() -
    dateOfBirth.getUTCFullYear();

  const month =
    eventDate.getUTCMonth() -
    dateOfBirth.getUTCMonth();

  if (
    month < 0 ||
    (month === 0 &&
      eventDate.getUTCDate() <
        dateOfBirth.getUTCDate())
  ) {
    age--;
  }

  return age;
}

export default async function ConsentPage({
  params,
}: PageProps) {
  const { id } = await params;

  const application =
    await prisma.showcaseApplication.findUnique({
      where: {
        id,
      },
    });

  if (!application) {
    notFound();
  }

  const age =
    calculateAge(
      application.dateOfBirth
    );

  const isUnder18 =
    age !== null && age < 18;

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-4"
          >
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
            href={`/apply/${application.eventSlug}/${application.id}/video`}
            className="text-sm font-medium text-white/60 transition hover:text-white"
          >
            Back
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1fr_340px] lg:px-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#c7ff2f]">
            Step 5 of 9
          </div>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Medical & Consent
          </h1>

          <p className="mt-3 max-w-2xl text-white/55">
            {isUnder18
              ? "A parent or legal guardian must review and accept the required medical consent and declarations on behalf of the player."
              : "Please provide the required medical information and review the declarations for the ASCEND Football Showcase."}
          </p>

          {isUnder18 && (
            <div className="mt-8 rounded-2xl border border-[#c7ff2f]/20 bg-[#c7ff2f]/[0.05] p-5">
              <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
                Parent / Guardian
              </div>

              <div className="mt-2 text-lg font-bold">
                {application.guardianName ||
                  "Guardian details required"}
              </div>

              {application.guardianRelationship && (
                <div className="mt-1 text-sm text-white/45">
                  {
                    application.guardianRelationship
                  }
                </div>
              )}

              <p className="mt-4 text-sm leading-6 text-white/60">
                The following consents and
                declarations are being made on
                behalf of{" "}
                <span className="font-semibold text-white">
                  {application.firstName}{" "}
                  {application.lastName}
                </span>
                .
              </p>
            </div>
          )}

          <form
            action={updateShowcaseConsent}
            className="mt-10 space-y-6"
          >
            <input
              type="hidden"
              name="applicationId"
              value={application.id}
            />

            <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <div className="text-lg font-black">
                Medical Information
              </div>

              <p className="mt-2 text-sm leading-6 text-white/45">
                Please tell us about any
                allergies, medical conditions,
                medication, previous injuries or
                other information the event
                medical team should know.
              </p>

              <textarea
                name="medicalNotes"
                rows={6}
                defaultValue={
                  application.medicalNotes ?? ""
                }
                placeholder="Enter relevant medical information, or write 'None'..."
                className="mt-5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none transition placeholder:text-white/20 focus:border-[#c7ff2f]/60"
              />
            </section>

            <ConsentCard
              name="medicalConsent"
              title={
                isUnder18
                  ? "Parent / Guardian Medical Consent"
                  : "Medical Consent"
              }
              checked={
                application.medicalConsent
              }
            >
              {isUnder18
                ? "I confirm that I am the parent or legal guardian of the player and consent to appropriate first aid and emergency medical assistance being provided if required during the event."
                : "I consent to appropriate first aid and emergency medical assistance being provided if required during the event."}
            </ConsentCard>

            <ConsentCard
              name="eventConsent"
              title="Participation Declaration"
              checked={
                application.eventConsent
              }
            >
              {isUnder18
                ? `I give permission for ${application.firstName} ${application.lastName} to participate in the ASCEND Football Showcase and acknowledge that football involves physical activity and an inherent risk of injury.`
                : "I agree to participate in the ASCEND Football Showcase and acknowledge that football involves physical activity and an inherent risk of injury."}
            </ConsentCard>

            <ConsentCard
              name="declarationConsent"
              title="Accuracy Declaration"
              checked={
                application.declarationConsent
              }
            >
              I confirm that the information
              provided during this application,
              including player, representation
              and medical information, is
              accurate to the best of my
              knowledge.
            </ConsentCard>

            <ConsentCard
              name="termsConsent"
              title="Terms & Conditions"
              checked={
                application.termsConsent
              }
            >
              <>
                I confirm that I have read and
                agree to the{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  className="font-bold text-[#c7ff2f] underline underline-offset-4"
                >
                  ASCEND Football Showcase Terms
                  & Conditions
                </Link>
                .
              </>
            </ConsentCard>

            <ConsentCard
              name="privacyConsent"
              title="Privacy Notice"
              checked={
                application.privacyConsent
              }
            >
              <>
                I confirm that I have read and
                understood the{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  className="font-bold text-[#c7ff2f] underline underline-offset-4"
                >
                  ASCEND Football Showcase
                  Privacy Notice
                </Link>
                , including how ASCEND processes
                personal details, football
                information and video evidence.
              </>
            </ConsentCard>

            <ConsentCard
              name="playerAgreementConsent"
              title="Player Agreement"
              checked={
                application.playerAgreementConsent
              }
            >
              <>
                I confirm that I have read and
                agree to the{" "}
                <Link
                  href="/player-agreement"
                  target="_blank"
                  className="font-bold text-[#c7ff2f] underline underline-offset-4"
                >
                  ASCEND Football Showcase Player
                  Agreement
                </Link>
                .
              </>
            </ConsentCard>

            <label className="flex gap-4 rounded-2xl border border-[#1685ff]/20 bg-[#1685ff]/[0.04] p-5">
              <input
                name="futureEventConsent"
                type="checkbox"
                defaultChecked={
                  application.futureEventConsent
                }
                className="mt-1"
              />

              <div>
                <div className="font-bold">
                  Future ASCEND Events &
                  Opportunities
                </div>

                <p className="mt-2 text-sm leading-6 text-white/55">
                  {isUnder18
                    ? `I would like ASCEND to keep me informed about future football showcases, trials and relevant opportunities for ${application.firstName} ${application.lastName}.`
                    : "I would like ASCEND to keep me informed about future football showcases, trials and relevant opportunities."}
                </p>

                <div className="mt-3 text-xs font-bold uppercase tracking-[0.1em] text-[#1685ff]">
                  Optional
                </div>
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
              {application.firstName}{" "}
              {application.lastName}
            </div>

            <div className="mt-1 text-[#c7ff2f]">
              Lagos 2027
            </div>

            <div className="mt-6 space-y-4 border-t border-white/10 pt-6 text-sm">
              <Row
                label="Age at event"
                value={
                  age !== null
                    ? `${age} ${
                        isUnder18
                          ? "(U18)"
                          : "(18+)"
                      }`
                    : "Unavailable"
                }
              />

              <Row
                label="Position"
                value={
                  application.position ||
                  "Not provided"
                }
              />

              <Row
                label="Application"
                value="In progress"
              />
            </div>

            <div className="mt-6 rounded-xl border border-[#c7ff2f]/15 bg-[#c7ff2f]/[0.05] p-4 text-sm leading-6 text-white/60">
              Medical information should be
              accurate and updated if anything
              changes before the Showcase.
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function ConsentCard({
  name,
  title,
  checked,
  children,
}: {
  name: string;
  title: string;
  checked: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <input
        name={name}
        type="checkbox"
        required
        defaultChecked={checked}
        className="mt-1"
      />

      <div>
        <div className="font-bold">
          {title}
        </div>

        <div className="mt-2 text-sm leading-6 text-white/55">
          {children}
        </div>
      </div>
    </label>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between gap-6">
      <span className="text-white/40">
        {label}
      </span>

      <span className="text-right">
        {value}
      </span>
    </div>
  );
}
