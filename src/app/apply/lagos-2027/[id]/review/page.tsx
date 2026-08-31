import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ReviewPage({
  params,
}: PageProps) {
  const { id } = await params;

  const application =
    await prisma.showcaseApplication.findUnique({
      where: {
        id,
      },

      include: {
        videos: {
          where: {
            status: {
              in: [
                "SUBMITTED",
                "PROCESSING",
                "READY",
              ],
            },
          },

          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

  if (!application) {
    notFound();
  }

  const requiredVideos = {
    MATCH_1: application.videos.find(
      (video) =>
        video.type === "MATCH_1"
    ),

    MATCH_2: application.videos.find(
      (video) =>
        video.type === "MATCH_2"
    ),

    HIGHLIGHTS: application.videos.find(
      (video) =>
        video.type === "HIGHLIGHTS"
    ),
  };

  const additionalVideos =
    application.videos.filter(
      (video) =>
        video.type ===
          "ADDITIONAL_MATCH" &&
        !video.requestId
    );

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
            href={`/apply/${application.eventSlug}/${application.id}/consent`}
            className="text-sm font-medium text-white/60 transition hover:text-white"
          >
            Back
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-14 lg:px-8">
        <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#c7ff2f]">
          Step 7 of 10
        </div>

        <h1 className="mt-3 text-4xl font-black sm:text-5xl">
          Review Application
        </h1>

        <p className="mt-3 max-w-3xl text-white/55">
          Please check your application
          carefully before proceeding to the
          Application & Assessment Fee.
        </p>

        <div className="mt-10 space-y-6">
          {/* PLAYER */}

          <ReviewSection
            title="Player Information"
            editHref={`/apply/${application.eventSlug}/${application.id}/player` }
          >
            <ReviewGrid>
              <Item
                label="Name"
                value={`${application.firstName} ${application.lastName}`}
              />

              <Item
                label="Date of birth"
                value={
                  application.dateOfBirth
                    ? application.dateOfBirth.toLocaleDateString(
                        "en-GB"
                      )
                    : "Not provided"
                }
              />

              <Item
                label="Age"
                value={
                  application.age !== null
                    ? String(application.age)
                    : "Not provided"
                }
              />

              <Item
                label="Nationality"
                value={
                  application.nationality ||
                  "Not provided"
                }
              />

              <Item
                label="Country of residence"
                value={
                  application.countryOfResidence ||
                  "Not provided"
                }
              />

              <Item
                label="State / Region"
                value={
                  application.stateRegion ||
                  "Not provided"
                }
              />

              <Item
                label="City"
                value={
                  application.city ||
                  "Not provided"
                }
              />

              <Item
                label="Primary position"
                value={
                  application.position ||
                  "Not provided"
                }
              />

              <Item
                label="Secondary position"
                value={
                  application.secondaryPosition ||
                  "Not provided"
                }
              />

              <Item
                label="Preferred foot"
                value={
                  application.preferredFoot ||
                  "Not provided"
                }
              />

              <Item
                label="Current club"
                value={
                  application.currentClub ||
                  "Not provided"
                }
              />

              <Item
                label="Current academy"
                value={
                  application.currentAcademy ||
                  "Not provided"
                }
              />
            </ReviewGrid>

            {application.footballBackground ? (
              <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs font-black uppercase tracking-[0.1em] text-white/35">
                  Football Background
                </div>

                <p className="mt-2 text-sm leading-6 text-white/60">
                  {
                    application.footballBackground
                  }
                </p>
              </div>
            ) : null}
          </ReviewSection>

          {/* CONTACT */}

          <ReviewSection
            title="Contact & Emergency Information"
            editHref={`/apply/${application.eventSlug}/${application.id}/contact`}
          >
            <ReviewGrid>
              <Item
                label="Email"
                value={application.email}
              />

              <Item
                label="Phone / WhatsApp"
                value={
                  application.phone ||
                  "Not provided"
                }
              />

              <Item
                label="Emergency contact"
                value={
                  application.emergencyContactName ||
                  "Not provided"
                }
              />

              <Item
                label="Relationship"
                value={
                  application.emergencyContactRelationship ||
                  "Not provided"
                }
              />

              <Item
                label="Emergency phone"
                value={
                  application.emergencyContactPhone ||
                  "Not provided"
                }
              />
            </ReviewGrid>

          </ReviewSection>

          {/* REPRESENTATION */}

          <ReviewSection
            title="Representation"
            editHref={`/apply/${application.eventSlug}/${application.id}/representation`}
          >
            <ReviewGrid>
              <Item
                label="Currently represented"
                value={
                  application.hasAgent === true
                    ? "Yes"
                    : application.hasAgent ===
                        false
                      ? "No"
                      : "Not answered"
                }
              />

              <Item
                label="Interested in ASCEND representation"
                value={
                  application.interestedInAscendRepresentation ===
                  true
                    ? "Yes"
                    : application.interestedInAscendRepresentation ===
                        false
                      ? "No"
                      : "Not answered"
                }
              />

              {application.hasAgent ? (
                <>
                  <Item
                    label="Agent"
                    value={
                      application.agentName ||
                      "Not provided"
                    }
                  />

                  <Item
                    label="Agency"
                    value={
                      application.agencyName ||
                      "Not provided"
                    }
                  />

                  <Item
                    label="FIFA licence"
                    value={
                      application.fifaLicenceNumber ||
                      "Not provided"
                    }
                  />

                  <Item
                    label="Representation exclusivity"
                    value={
                      application.exclusiveRepresentation ||
                      "Not provided"
                    }
                  />
                </>
              ) : null}
            </ReviewGrid>
          </ReviewSection>

          {/* VIDEO */}

          <ReviewSection
            title="Video Evidence"
            editHref={`/apply/${application.eventSlug}/${application.id}/video`}
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <VideoItem
                title="Match Footage 1"
                video={
                  requiredVideos.MATCH_1
                }
              />

              <VideoItem
                title="Match Footage 2"
                video={
                  requiredVideos.MATCH_2
                }
              />

              <VideoItem
                title="Highlights"
                video={
                  requiredVideos.HIGHLIGHTS
                }
              />

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs font-black uppercase tracking-[0.1em] text-white/35">
                  Additional Videos
                </div>

                <div className="mt-3 text-2xl font-black">
                  {
                    additionalVideos.length
                  }
                </div>

                <div className="mt-1 text-xs text-white/40">
                  Optional evidence submitted
                </div>
              </div>
            </div>
          </ReviewSection>

{/* IDENTITY & AGE VERIFICATION */}

<ReviewSection
  title="Identity & Age Verification"
  editHref={`/apply/${application.eventSlug}/${application.id}/identity`}
>
  <ReviewGrid>
    <Item
      label="International Passport"
      value="Submitted for verification"
    />

    <Item
      label="NIN Documentation"
      value="Submitted for verification"
    />

    <Item
      label="Player Headshot"
      value="Submitted for verification"
    />
  </ReviewGrid>

  <div className="mt-5 rounded-xl border border-[#1685ff]/20 bg-[#1685ff]/[0.04] p-4">
    <div className="text-xs font-black uppercase tracking-[0.1em] text-[#1685ff]">
      Verification
    </div>

    <p className="mt-2 text-sm leading-6 text-white/60">
      Your identity documents and age eligibility
      will be verified by the ASCEND team before
      your football evidence is released for
      selector assessment.
    </p>
  </div>
</ReviewSection>

          {/* MEDICAL / CONSENT */}

          <ReviewSection
            title="Medical & Consent"
            editHref={`/apply/${application.eventSlug}/${application.id}/consent`}
          >
            <ReviewGrid>
              <Item
                label="Medical information"
                value={
                  application.medicalNotes ||
                  "None provided"
                }
              />

              <Item
                label="Medical consent"
                value={
                  application.medicalConsent
                    ? "Accepted"
                    : "Not accepted"
                }
              />

              <Item
                label="Participation declaration"
                value={
                  application.eventConsent
                    ? "Accepted"
                    : "Not accepted"
                }
              />

              <Item
                label="Accuracy declaration"
                value={
                  application.declarationConsent
                    ? "Accepted"
                    : "Not accepted"
                }
              />

              <Item
                label="Terms & Conditions"
                value={
                  application.termsConsent
                    ? "Accepted"
                    : "Not accepted"
                }
              />

              <Item
                label="Privacy Notice"
                value={
                  application.privacyConsent
                    ? "Accepted"
                    : "Not accepted"
                }
              />

              <Item
                label="Player Agreement"
                value={
                  application.playerAgreementConsent
                    ? "Accepted"
                    : "Not accepted"
                }
              />

              <Item
                label="Future ASCEND communications"
                value={
                  application.futureEventConsent
                    ? "Yes"
                    : "No"
                }
              />
            </ReviewGrid>
          </ReviewSection>
        </div>

        {/* IMPORTANT */}

        <div className="mt-10 rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] p-6">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">
            Important
          </div>

<p className="mt-3 text-sm leading-7 text-white/65">
  The Application & Assessment Fee covers
  the processing and professional assessment
  of your application and submitted football
  evidence.
</p>

<p className="mt-3 font-bold leading-7 text-white">
  Payment of the Application & Assessment
  Fee does not guarantee selection or an
  invitation to the ASCEND Lagos 2027 camp.
</p>

<p className="mt-3 text-sm leading-7 text-white/55">
  Further video evidence may be requested
  during the assessment process. The
  strongest eligible applicants will
  progress, with the best 100 players
  selected for the final camp.
</p>        

        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/apply/${application.eventSlug}/${application.id}/consent`}
            className="text-sm font-bold text-white/45 transition hover:text-white"
          >
            ← Back
          </Link>

          <Link
            href={`/apply/${application.eventSlug}/${application.id}/assessment-fee`}
            className="rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90"
          >
            Continue to Assessment Fee
          </Link>
        </div>
      </section>
    </main>
  );
}

function ReviewSection({
  title,
  editHref,
  children,
}: {
  title: string;
  editHref: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-black">
          {title}
        </h2>

        <Link
          href={editHref}
          className="text-xs font-black uppercase tracking-[0.08em] text-[#c7ff2f]"
        >
          Edit
        </Link>
      </div>

      <div className="mt-6">
        {children}
      </div>
    </section>
  );
}

function ReviewGrid({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  );
}

function Item({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-xs font-black uppercase tracking-[0.08em] text-white/35">
        {label}
      </div>

      <div className="mt-1 break-words text-sm font-semibold text-white/75">
        {value}
      </div>
    </div>
  );
}

function VideoItem({
  title,
  video,
}: {
  title: string;
  video:
    | {
        originalFilename: string | null;
        status: string;
      }
    | undefined;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="text-xs font-black uppercase tracking-[0.1em] text-white/35">
        {title}
      </div>

      {video ? (
        <>
          <div className="mt-3 text-sm font-black text-[#c7ff2f]">
            ✓ Submitted
          </div>

          <div className="mt-2 truncate text-xs text-white/40">
            {video.originalFilename ||
              "Video submitted"}
          </div>
        </>
      ) : (
        <div className="mt-3 text-sm font-bold text-red-300">
          Missing
        </div>
      )}
    </div>
  );
}
