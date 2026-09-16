import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";

import RevelationX1Logo from "@/components/brand/RevelationX1Logo";
import PrintBadgeButton from "@/components/staff/PrintBadgeButton";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

export default async function ShowcasePlayerBadgePage({
  params,
}: {
  params: Promise<{
    token: string;
  }>;
}) {
  await requireStaffUser();

  const { token } = await params;

  const application = await prisma.showcaseApplication.findUnique({
    where: {
      checkInToken: token,
    },

    select: {
      id: true,
      firstName: true,
      lastName: true,
      position: true,
      status: true,
      eventSlug: true,
      selectionDecisionReleasedAt: true,
      selectionResponse: true,

      selectedPlayerConfirmation: {
        select: {
          confirmedAt: true,
        },
      },

      registrationNumber: true,
      assessmentCode: true,
      checkedInAt: true,

      identityDocuments: {
        where: {
          type: "HEADSHOT",
        },

        select: {
          uploadedAt: true,
          storageKey: true,
        },

        take: 1,
      },
    },
  });

  if (!application) {
    notFound();
  }

  const event = await prisma.event.findUnique({
    where: {
      slug: application.eventSlug,
    },

    select: {
      selectionDecisionsReleasedAt: true,
    },
  });

  const credentialEligible =
    Boolean(event?.selectionDecisionsReleasedAt) &&
    Boolean(application.selectionDecisionReleasedAt) &&
    application.status === "SELECTED" &&
    application.selectionResponse === "ACCEPTED" &&
    Boolean(application.selectedPlayerConfirmation?.confirmedAt);

  if (!credentialEligible || !application.checkedInAt) {
    return (
      <main className="min-h-screen bg-[#090909] px-6 py-16 text-white">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <RevelationX1Logo
            href=""
            size="md"
            theme="dark"
            descriptor="Football Showcase"
          />

          <div className="mt-8 text-xs font-black uppercase tracking-[0.18em] text-red-400">
            Badge Not Available
          </div>

          <h1 className="mt-4 text-3xl font-black">Check-In Required</h1>

          <p className="mt-4 leading-7 text-white/50">
            This player must hold a valid Lagos 2027 event credential and
            complete REVELATIONX1 event check-in before a player badge can be
            printed.
          </p>

          <Link
            href={`/showcase-checkin/${token}`}
            className="mt-7 inline-flex rounded-full border border-white/10 px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-white/60 transition hover:text-white"
          >
            Return to Check-In
          </Link>
        </div>
      </main>
    );
  }

  const headshot = application.identityDocuments[0];

  const hasHeadshot = Boolean(headshot?.storageKey && headshot.uploadedAt);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is required to generate event credential QR codes.",
    );
  }

  const credentialUrl = `${appUrl}/showcase-checkin/${token}`;

  const qrDataUrl = await QRCode.toDataURL(credentialUrl, {
    width: 500,
    margin: 1,
    errorCorrectionLevel: "H",
  });

  const credentialNumber =
    application.registrationNumber ||
    application.assessmentCode ||
    "REVELATIONX1 PLAYER";

  const credentialLabel = application.registrationNumber
    ? "Registration Number"
    : application.assessmentCode
      ? "Assessment Code"
      : "Player Credential";

  return (
    <>
      <style>{`
        @page {
          size: 100mm 150mm;
          margin: 0;
        }

        @media print {
          html,
          body {
            width: 100mm;
            height: 150mm;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      <main className="min-h-screen bg-[#111] px-4 py-10 text-white print:min-h-0 print:bg-white print:p-0">
        {/* SCREEN CONTROLS */}

        <div className="mx-auto mb-6 flex max-w-[100mm] items-center justify-between gap-4 print:hidden">
          <Link
            href={`/showcase-checkin/${token}`}
            className="text-sm font-semibold text-white/50 transition hover:text-white"
          >
            ← Check-In
          </Link>

          <PrintBadgeButton />
        </div>

        {/* PHYSICAL BADGE */}

        <section className="mx-auto flex h-[150mm] w-[100mm] flex-col overflow-hidden bg-white text-black shadow-2xl print:shadow-none">
          {/* HEADER */}

          <div className="bg-black px-[8mm] pb-[5mm] pt-[7mm] text-white">
            <RevelationX1Logo
              href=""
              variant="wordmark"
              size="sm"
              theme="dark"
            />

            <div className="mt-[2mm] text-[8px] font-bold uppercase tracking-[0.22em] text-white/55">
              Football Showcase
            </div>

            <div className="mt-[4mm] flex items-center justify-between border-t border-white/15 pt-[3mm]">
              <div className="text-[11px] font-black uppercase tracking-[0.1em] text-[#c7ff2f]">
                Lagos 2027
              </div>

              <div className="text-[8px] font-bold uppercase tracking-[0.1em] text-white/60">
                Player Credential
              </div>
            </div>
          </div>

          {/* PHOTO */}

          <div className="flex justify-center px-[8mm] pt-[7mm]">
            <div className="h-[47mm] w-[47mm] overflow-hidden rounded-[4mm] border-[1.2mm] border-black bg-neutral-200">
              {hasHeadshot ? (
                <img
                  src={`/api/showcase-applications/${application.id}/headshot`}
                  alt={`${application.firstName} ${application.lastName}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-4 text-center text-[9px] font-bold uppercase text-black/30">
                  Photo Unavailable
                </div>
              )}
            </div>
          </div>

          {/* IDENTITY */}

          <div className="px-[7mm] pt-[5mm] text-center">
            <div className="text-[21px] font-black uppercase leading-none">
              {application.firstName} {application.lastName}
            </div>

            <div className="mt-[3mm] bg-black px-[3mm] py-[2.5mm] text-[12px] font-black uppercase tracking-[0.08em] text-white">
              {application.position || "Player"}
            </div>

            <div className="mt-[4mm] text-[8px] font-bold uppercase tracking-[0.14em] text-black/45">
              {credentialLabel}
            </div>

            <div className="mt-[1mm] text-[15px] font-black tracking-[0.03em]">
              {credentialNumber}
            </div>
          </div>

          {/* QR */}

          <div className="mt-auto flex items-center gap-[5mm] border-t border-black/10 px-[7mm] py-[5mm]">
            <div className="h-[28mm] w-[28mm] shrink-0">
              <img
                src={qrDataUrl}
                alt="Player event credential QR"
                className="h-full w-full"
              />
            </div>

            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.08em]">
                Event Credential
              </div>

              <p className="mt-[1.5mm] text-[7px] leading-[1.45] text-black/55">
                This credential must be displayed while inside REVELATIONX1
                controlled event areas.
              </p>

              <div className="mt-[2mm] text-[7px] font-bold uppercase tracking-[0.08em]">
                Scan to verify player credential
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
