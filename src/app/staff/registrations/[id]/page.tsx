import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";
import PlayVideoButton from "@/components/video/PlayVideoButton";

type RegistrationDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RegistrationDetailPage({
  params,
}: RegistrationDetailPageProps) {
  await requireStaffUser();

  const { id } = await params;

  const registration =
    await prisma.registration.findUnique({
      where: {
        id,
      },

      include: {
        event: true,

        payments: {
          orderBy: {
            createdAt: "desc",
          },
        },

        videos: {
          orderBy: {
            createdAt: "desc",
          },
        },

        representationDeclaration: true,

        representationHistory: {
          orderBy: {
            createdAt: "desc",
          },
        },

        introductions: {
          include: {
            requestedByScout: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

  if (!registration) {
    notFound();
  }

  const paidPayment =
    registration.payments.find(
      (payment) => payment.status === "PAID",
    ) ?? null;

  const representationInterest =
    registration.representationDeclaration
      ?.interestedInAscendRepresentation;

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <Link
          href="/staff/registrations"
          className="text-sm text-white/40 transition hover:text-white"
        >
          ← Registrations
        </Link>

        {/* HEADER */}

        <div className="mt-8 flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
              {registration.event.edition}
            </div>

            <h1 className="mt-3 text-4xl font-black sm:text-5xl">
              {registration.firstName || "Unnamed"}{" "}
              {registration.lastName || "Player"}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Badge>
                {registration.registrationNumber ||
                  "Registration pending"}
              </Badge>

              <Badge>
                {formatStatus(registration.status)}
              </Badge>

              {registration.checkedInAt ? (
                <Badge accent>
                  Checked In
                </Badge>
              ) : (
                <Badge>
                  Not Checked In
                </Badge>
              )}
            </div>
          </div>

          {representationInterest === true && (
            <div className="rounded-2xl border border-[#c7ff2f]/30 bg-[#c7ff2f]/[0.06] px-5 py-4">
              <div className="text-xs font-black uppercase tracking-[0.1em] text-[#c7ff2f]">
                Representation Lead
              </div>

              <div className="mt-2 font-black">
                Interested in ASCEND
              </div>
            </div>
          )}
        </div>

        {/* PLAYER + CONTACT */}

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Panel
            eyebrow="Player"
            title="Football Profile"
          >
            <InfoGrid>
              <Info
                label="Date of birth"
                value={formatDate(
                  registration.dateOfBirth,
                )}
              />

              <Info
                label="Nationality"
                value={registration.nationality}
              />

              <Info
                label="Primary position"
                value={registration.primaryPosition}
              />

              <Info
                label="Secondary position"
                value={registration.secondaryPosition}
              />

              <Info
                label="Preferred foot"
                value={registration.preferredFoot}
              />

              <Info
                label="Current club"
                value={registration.currentClub}
              />

              <Info
                label="Academy"
                value={registration.academyName}
              />

              <Info
                label="Height"
                value={
                  registration.heightCm
                    ? `${registration.heightCm} cm`
                    : null
                }
              />

              <Info
                label="Weight"
                value={
                  registration.weightKg
                    ? `${registration.weightKg} kg`
                    : null
                }
              />
            </InfoGrid>
          </Panel>

          <Panel
            eyebrow="Contact"
            title="Player & Emergency Details"
          >
            <InfoGrid>
              <Info
                label="Email"
                value={registration.email}
              />

              <Info
                label="Phone"
                value={registration.phone}
              />

              <Info
                label="Guardian"
                value={registration.guardianName}
              />

              <Info
                label="Relationship"
                value={
                  registration.guardianRelationship
                }
              />

              <Info
                label="Guardian email"
                value={registration.guardianEmail}
              />

              <Info
                label="Guardian phone"
                value={registration.guardianPhone}
              />

              <Info
                label="Emergency contact"
                value={
                  registration.emergencyContactName
                }
              />

              <Info
                label="Emergency phone"
                value={
                  registration.emergencyContactPhone
                }
              />
            </InfoGrid>
          </Panel>
        </div>

        {/* REPRESENTATION */}

        <div className="mt-6">
          <Panel
            eyebrow="Representation"
            title="Representation Status"
          >
            <InfoGrid>
              <Info
                label="Status"
                value={
                  registration.representationStatus ===
                  "REPRESENTED"
                    ? "Currently represented"
                    : registration.representationStatus ===
                        "UNREPRESENTED_OPEN"
                      ? "Not currently represented"
                      : "Status unclear"
                }
              />

              {registration.representationStatus ===
                "UNREPRESENTED_OPEN" && (
                <Info
                  label="ASCEND representation interest"
                  value={
                    representationInterest === true
                      ? "Interested in being contacted by ASCEND"
                      : representationInterest ===
                          false
                        ? "Not interested at this time"
                        : "No choice recorded"
                  }
                />
              )}

              {registration.representationDeclaration && (
                <>
                  <Info
                    label="Agent"
                    value={
                      registration
                        .representationDeclaration
                        .agentName
                    }
                  />

                  <Info
                    label="Agency"
                    value={
                      registration
                        .representationDeclaration
                        .agencyName
                    }
                  />

                  <Info
                    label="Agent email"
                    value={
                      registration
                        .representationDeclaration
                        .agentEmail
                    }
                  />

                  <Info
                    label="Agent phone"
                    value={
                      registration
                        .representationDeclaration
                        .agentPhone
                    }
                  />

                  <Info
                    label="FIFA licence"
                    value={
                      registration
                        .representationDeclaration
                        .fifaLicenceNumber
                    }
                  />

                  <Info
                    label="ASCEND contact authorised"
                    value={
                      registration
                        .representationDeclaration
                        .agentContactConsent
                        ? "Yes"
                        : "No"
                    }
                  />
                </>
              )}
            </InfoGrid>
          </Panel>
        </div>

        {/* VIDEO + PAYMENT */}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Panel
            eyebrow="Video"
            title="Player Video"
          >
            {registration.videos.length > 0 ? (
              <div className="space-y-5">
                {registration.videos.map(
                  (video) => (
                    <div
                      key={video.id}
                      className="rounded-xl border border-white/10 bg-black/20 p-4"
                    >
                      <Info
                        label="Source"
                        value={
                          video.sourceType ===
                          "DIRECT_UPLOAD"
                            ? "Uploaded video"
                            : video.sourceType ===
                                "EXTERNAL_LINK"
                              ? "External video link"
                              : "Video"
                        }
                      />

                      {video.originalFilename && (
                        <div className="mt-4">
                          <Info
                            label="Uploaded file"
                            value={
                              video.originalFilename
                            }
                          />

                          <PlayVideoButton
                            videoId={video.id}
                          />
                        </div>
                      )}

                      {video.externalUrl && (
                        <div className="mt-4">
                          <div className="text-xs uppercase tracking-[0.08em] text-white/35">
                            Video link
                          </div>

                          <a
                            href={video.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 block break-all text-sm text-[#c7ff2f] underline underline-offset-4"
                          >
                            {video.externalUrl}
                          </a>
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
            ) : (
              <EmptyValue>
                No video submitted.
              </EmptyValue>
            )}
          </Panel>

          <Panel
            eyebrow="Payment"
            title="Payment Status"
          >
            {paidPayment ? (
              <InfoGrid>
                <Info
                  label="Status"
                  value="Paid"
                />

                <Info
                  label="Amount"
                  value={formatMoney(
                    paidPayment.amount,
                    paidPayment.currency,
                  )}
                />

                <Info
                  label="Provider"
                  value={paidPayment.provider}
                />

                <Info
                  label="Reference"
                  value={
                    paidPayment.providerReference
                  }
                />

                <Info
                  label="Paid"
                  value={formatDateTime(
                    paidPayment.paidAt,
                  )}
                />
              </InfoGrid>
            ) : (
              <div>
                <Info
                  label="Registration status"
                  value={formatStatus(
                    registration.status,
                  )}
                />

                <div className="mt-5 text-sm text-white/40">
                  No completed payment recorded.
                </div>
              </div>
            )}
          </Panel>
        </div>

        {/* CONSENTS */}

        <div className="mt-6">
          <Panel
            eyebrow="Legal"
            title="Consent & Agreements"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Consent
                label="Medical"
                accepted={registration.medicalConsent}
              />

              <Consent
                label="Participation"
                accepted={registration.eventConsent}
              />

              <Consent
                label="Accuracy"
                accepted={
                  registration.declarationConsent
                }
              />

              <Consent
                label="Terms & Conditions"
                accepted={registration.termsConsent}
              />

              <Consent
                label="Privacy Notice"
                accepted={registration.privacyConsent}
              />

              <Consent
                label="Player Agreement"
                accepted={
                  registration.playerAgreementConsent
                }
              />

              <Consent
                label="Media"
                accepted={
                  registration.mediaConsent === true
                }
                neutral={
                  registration.mediaConsent === null
                }
              />
            </div>
          </Panel>
        </div>

        {/* MEDICAL + EVENT */}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Panel
            eyebrow="Medical"
            title="Medical Information"
          >
            <Info
              label="Medical notes"
              value={registration.medicalNotes}
            />
          </Panel>

          <Panel
            eyebrow="Event"
            title={registration.event.edition}
          >
            <InfoGrid>
              <Info
                label="Venue"
                value={registration.event.venue}
              />

              <Info
                label="City"
                value={`${registration.event.city}, ${registration.event.country}`}
              />

              <Info
                label="Football starts"
                value={formatDateTime(
                  registration.event
                    .footballStartsAt,
                )}
              />

              <Info
                label="Football ends"
                value={formatDateTime(
                  registration.event
                    .footballEndsAt,
                )}
              />

              <Info
                label="Registration created"
                value={formatDateTime(
                  registration.createdAt,
                )}
              />

              <Info
                label="Current step"
                value={formatStatus(
                  registration.currentStep,
                )}
              />
            </InfoGrid>
          </Panel>
        </div>

        {/* CHECK-IN */}

        <div className="mt-6">
          <Panel
            eyebrow="Operations"
            title="Check-in"
          >
            <InfoGrid>
              <Info
                label="Status"
                value={
                  registration.checkedInAt
                    ? "Checked in"
                    : "Not checked in"
                }
              />

              <Info
                label="Checked in at"
                value={formatDateTime(
                  registration.checkedInAt,
                )}
              />

              <Info
                label="Check-in token"
                value={registration.checkInToken}
              />
            </InfoGrid>
          </Panel>
        </div>

        {/* INTRODUCTIONS */}

        {registration.introductions.length > 0 && (
          <div className="mt-6">
            <Panel
              eyebrow="Recruitment"
              title="Scout & Club Activity"
            >
              <div className="space-y-4">
                {registration.introductions.map(
                  (introduction) => (
                    <div
                      key={introduction.id}
                      className="rounded-xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="font-black">
                        {
                          introduction
                            .requestedByScout
                            .fullName
                        }
                      </div>

                      <div className="mt-1 text-sm text-white/45">
                        {introduction
                          .requestedByScout
                          .organisationName ||
                          "Organisation not recorded"}
                      </div>

                      <div className="mt-3 text-xs uppercase tracking-[0.08em] text-[#c7ff2f]">
                        {formatStatus(
                          introduction.status,
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </Panel>
          </div>
        )}
      </section>
    </main>
  );
}

function Panel({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
      <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
        {eyebrow}
      </div>

      <h2 className="mt-2 text-xl font-black">
        {title}
      </h2>

      <div className="mt-6 border-t border-white/10 pt-6">
        {children}
      </div>
    </section>
  );
}

function InfoGrid({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {children}
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value:
    | string
    | number
    | null
    | undefined;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.08em] text-white/35">
        {label}
      </div>

      <div className="mt-1 break-words text-sm text-white/80">
        {value || "—"}
      </div>
    </div>
  );
}

function Consent({
  label,
  accepted,
  neutral = false,
}: {
  label: string;
  accepted: boolean;
  neutral?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="text-xs uppercase tracking-[0.08em] text-white/35">
        {label}
      </div>

      <div
        className={`mt-2 font-black ${
          neutral
            ? "text-white/40"
            : accepted
              ? "text-[#c7ff2f]"
              : "text-red-300"
        }`}
      >
        {neutral
          ? "Not recorded"
          : accepted
            ? "Accepted"
            : "Not accepted"}
      </div>
    </div>
  );
}

function Badge({
  children,
  accent = false,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.06em] ${
        accent
          ? "border-[#c7ff2f]/30 bg-[#c7ff2f]/[0.06] text-[#c7ff2f]"
          : "border-white/10 bg-white/[0.025] text-white/55"
      }`}
    >
      {children}
    </span>
  );
}

function EmptyValue({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="text-sm text-white/35">
      {children}
    </div>
  );
}

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatDate(
  value: Date | null | undefined,
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      dateStyle: "medium",
    },
  ).format(value);
}

function formatDateTime(
  value: Date | null | undefined,
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(value);
}

function formatMoney(
  amountInMinorUnits: number,
  currency: string,
) {
  try {
    return new Intl.NumberFormat(
      "en-GB",
      {
        style: "currency",
        currency,
      },
    ).format(amountInMinorUnits / 100);
  } catch {
    return `${currency} ${(amountInMinorUnits / 100).toFixed(2)}`;
  }
}
