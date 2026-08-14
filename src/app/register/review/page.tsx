import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getAgeAtEvent } from "@/lib/registration/ageAtEvent";
import { continueToPayment } from "../actions/continueToPayment";

import PlayVideoButton from "@/components/video/PlayVideoButton";

type ReviewPageProps = {
  searchParams: Promise<{
    registration?: string;
  }>;
};

function formatDate(date: Date | null) {
  if (!date) {
    return "Not provided";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function displayValue(value: string | null | undefined) {
  return value?.trim() || "Not provided";
}

export default async function ReviewPage({
  searchParams,
}: ReviewPageProps) {
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
      videos: true,
      representationDeclaration: true,
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
            href={`/register/media-publicity?registration=${registration.id}`}
            className="text-sm font-medium text-white/60 transition hover:text-white"
          >
            Back
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1fr_340px] lg:px-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#c7ff2f]">
            Step 8 of 10
          </div>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Review Registration
          </h1>

          <p className="mt-3 max-w-2xl text-white/55">
            Please check the information below carefully before continuing to
            payment. You can return to any section if something needs changing.
          </p>

          <div className="mt-10 space-y-6">
            {/* PLAYER DETAILS */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
                    Player
                  </div>

                  <h2 className="mt-2 text-xl font-black">
                    Player Details
                  </h2>
                </div>

                <Link
                  href={`/register?registration=${registration.id}`}
                  className="text-sm font-bold text-white/45 transition hover:text-[#c7ff2f]"
                >
                  Edit
                </Link>
              </div>

              <div className="mt-6 grid gap-5 border-t border-white/10 pt-6 sm:grid-cols-2">
                <ReviewItem
                  label="Name"
                  value={`${registration.firstName ?? ""} ${
                    registration.lastName ?? ""
                  }`.trim()}
                />

                <ReviewItem
                  label="Date of birth"
                  value={formatDate(registration.dateOfBirth)}
                />

                <ReviewItem
                  label="Age at event"
                  value={
                    ageAtEvent !== null
                      ? `${ageAtEvent} ${
                          isUnder18AtEvent ? "(U18)" : "(18+)"
                        }`
                      : "Unavailable"
                  }
                />

                <ReviewItem
                  label="Nationality"
                  value={displayValue(registration.nationality)}
                />

                <ReviewItem
                  label="Primary position"
                  value={displayValue(registration.primaryPosition)}
                />

                <ReviewItem
                  label="Preferred foot"
                  value={displayValue(registration.preferredFoot)}
                />

                <ReviewItem
                  label="Current club / academy"
                  value={displayValue(registration.currentClub)}
                />
              </div>
            </section>

            {/* CONTACT */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
                    Contact
                  </div>

                  <h2 className="mt-2 text-xl font-black">
                    {isUnder18AtEvent
                      ? "Parent / Guardian Contact"
                      : "Player Contact"}
                  </h2>
                </div>

                <Link
                  href={`/register/contact?registration=${registration.id}`}
                  className="text-sm font-bold text-white/45 transition hover:text-[#c7ff2f]"
                >
                  Edit
                </Link>
              </div>

              <div className="mt-6 grid gap-5 border-t border-white/10 pt-6 sm:grid-cols-2">
                {isUnder18AtEvent ? (
                  <>
                    <ReviewItem
                      label="Parent / Guardian"
                      value={displayValue(registration.guardianName)}
                    />

                    <ReviewItem
                      label="Relationship"
                      value={displayValue(
                        registration.guardianRelationship,
                      )}
                    />

                    <ReviewItem
                      label="Email"
                      value={displayValue(registration.guardianEmail)}
                    />

                    <ReviewItem
                      label="Phone / WhatsApp"
                      value={displayValue(registration.guardianPhone)}
                    />
                  </>
                ) : (
                  <>
                    <ReviewItem
                      label="Email"
                      value={displayValue(registration.email)}
                    />

                    <ReviewItem
                      label="Phone / WhatsApp"
                      value={displayValue(registration.phone)}
                    />
                  </>
                )}
              </div>
            </section>

            {/* REPRESENTATION */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
                    Representation
                  </div>

                  <h2 className="mt-2 text-xl font-black">
                    Representation Status
                  </h2>
                </div>

                <Link
                  href={`/register/representation?registration=${registration.id}`}
                  className="text-sm font-bold text-white/45 transition hover:text-[#c7ff2f]"
                >
                  Edit
                </Link>
              </div>

              <div className="mt-6 grid gap-5 border-t border-white/10 pt-6 sm:grid-cols-2">
                <ReviewItem
                  label="Status"
                  value={
                    registration.representationStatus === "UNREPRESENTED_OPEN"
                      ? "Not currently represented"
                      : registration.representationStatus === "REPRESENTED"
                        ? "Currently represented"
                        : displayValue(registration.representationStatus)
                  }
                />

                {registration.representationStatus === "UNREPRESENTED_OPEN" && (
                  <ReviewItem
                    label="ASCEND representation interest"
                    value={
                      registration.representationDeclaration
                        ?.interestedInAscendRepresentation === true
                        ? "Interested in being contacted by ASCEND"
                        : registration.representationDeclaration
                              ?.interestedInAscendRepresentation === false
                          ? "Not interested at this time"
                          : "No choice recorded"
                    }
                  />
                )}
              </div>
            </section>

            {/* VIDEO */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
                    Football Video
                  </div>

                  <h2 className="mt-2 text-xl font-black">
                    Player Video
                  </h2>
                </div>

                <Link
                  href={`/register/video?registration=${registration.id}`}
                  className="text-sm font-bold text-white/45 transition hover:text-[#c7ff2f]"
                >
                  Edit
                </Link>
              </div>

              <div className="mt-6 border-t border-white/10 pt-6">
{registration.videos.length > 0 ? (
  <div className="grid gap-5 sm:grid-cols-2">
    {registration.videos.map((video) => (
      <div key={video.id} className="space-y-4">
        <ReviewItem
          label="Video source"
          value={
            video.sourceType === "EXTERNAL_LINK"
              ? "External video link"
              : video.sourceType === "DIRECT_UPLOAD"
                ? "Uploaded video"
                : "Video"
          }
        />

        {video.externalUrl && (
          <div>
            <div className="text-xs uppercase tracking-[0.1em] text-white/35">
              Video link
            </div>

            <a
              href={video.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block break-all text-sm leading-6 text-[#c7ff2f] underline underline-offset-4"
            >
              {video.externalUrl}
            </a>
          </div>
        )}

        {video.originalFilename && (
         <>
          <ReviewItem
            label="Uploaded file"
            value={video.originalFilename}
          />

        <PlayVideoButton
           videoId={video.id}
        />
       </>
        )}
      </div>
    ))}
  </div>
) : (
  <ReviewItem
    label="Video"
    value="No saved video yet"
  />
)}
              </div>
            </section>

            {/* MEDICAL */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
                    Medical
                  </div>

                  <h2 className="mt-2 text-xl font-black">
                    Medical & Emergency Information
                  </h2>
                </div>

                <Link
                  href={`/register/medical-consent?registration=${registration.id}`}
                  className="text-sm font-bold text-white/45 transition hover:text-[#c7ff2f]"
                >
                  Edit
                </Link>
              </div>

              <div className="mt-6 grid gap-5 border-t border-white/10 pt-6 sm:grid-cols-2">
                <ReviewItem
                  label="Medical information"
                  value={displayValue(registration.medicalNotes)}
                />

                <ReviewItem
                  label="Emergency contact"
                  value={displayValue(
                    registration.emergencyContactName,
                  )}
                />

                <ReviewItem
                  label="Emergency phone"
                  value={displayValue(
                    registration.emergencyContactPhone,
                  )}
                />

                <ReviewItem
                  label={
                    isUnder18AtEvent
                      ? "Guardian medical consent"
                      : "Medical consent"
                  }
                  value={
                    registration.medicalConsent
                      ? "Confirmed"
                      : "Not confirmed"
                  }
                />
              </div>
            </section>

            {/* DECLARATIONS */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
                    Declarations
                  </div>

                  <h2 className="mt-2 text-xl font-black">
                    Consent & Declarations
                  </h2>
                </div>

                <Link
                  href={`/register/declarations?registration=${registration.id}`}
                  className="text-sm font-bold text-white/45 transition hover:text-[#c7ff2f]"
                >
                  Edit
                </Link>
              </div>

              <div className="mt-6 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-2">
                <ConsentStatus
                  label="Participation declaration"
                  accepted={registration.eventConsent}
                />

                <ConsentStatus
                  label="Accuracy declaration"
                  accepted={registration.declarationConsent}
                />

                <ConsentStatus
                  label="Terms & Conditions"
                  accepted={registration.termsConsent}
                />

                <ConsentStatus
                  label="Privacy Notice"
                  accepted={registration.privacyConsent}
                />
              </div>
            </section>

            {/* MEDIA */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
                    Media
                  </div>

                  <h2 className="mt-2 text-xl font-black">
                    Media & Publicity
                  </h2>
                </div>

                <Link
                  href={`/register/media-publicity?registration=${registration.id}`}
                  className="text-sm font-bold text-white/45 transition hover:text-[#c7ff2f]"
                >
                  Edit
                </Link>
              </div>

              <div className="mt-6 border-t border-white/10 pt-6">
                <ReviewItem
                  label="Media & publicity"
                  value={
                    registration.mediaConsent === true
                      ? "Authorised"
                      : registration.mediaConsent === false
                        ? "Not authorised"
                        : "No choice recorded"
                  }
                />
              </div>
            </section>
          </div>

          <div className="mt-8 rounded-2xl border border-[#c7ff2f]/20 bg-[#c7ff2f]/[0.05] p-6">
            <div className="text-lg font-black">
              Ready to continue?
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Please make sure all information is correct. Once payment is
              completed, your ASCEND Football Showcase registration will move
              toward confirmation.
            </p>

            <form
              action={continueToPayment}
              className="mt-6 flex justify-end"
            >
              <input
                type="hidden"
                name="registrationId"
                value={registration.id}
              />

              <button
                type="submit"
                className="rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90"
              >
                Continue to Payment
              </button>
            </form>
          </div>
        </div>
        {/* SIDEBAR */}
        <aside>
          <div className="sticky top-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/40">
              Registration Review
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
                  Venue
                </span>

                <span className="text-right">
                  {registration.event.venue}
                </span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-white/40">
                  Next step
                </span>

                <span>Payment</span>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-[#c7ff2f]/15 bg-[#c7ff2f]/[0.05] p-4 text-sm leading-6 text-white/60">
              You can still edit your registration before continuing to
              payment.
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function ReviewItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.1em] text-white/35">
        {label}
      </div>

      <div className="mt-1 text-sm leading-6 text-white/80">
        {value}
      </div>
    </div>
  );
}

function ConsentStatus({
  label,
  accepted,
}: {
  label: string;
  accepted: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
      <span className="text-sm text-white/60">
        {label}
      </span>

      <span
        className={
          accepted
            ? "text-xs font-bold uppercase tracking-[0.08em] text-[#c7ff2f]"
            : "text-xs font-bold uppercase tracking-[0.08em] text-red-300"
        }
      >
        {accepted ? "Confirmed" : "Missing"}
      </span>
    </div>
  );
}
