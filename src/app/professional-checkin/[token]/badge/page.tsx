import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

import PrintBadgeButton from "@/components/staff/PrintBadgeButton";

export default async function ProfessionalBadgePage({
  params,
}: {
  params: Promise<{
    token: string;
  }>;
}) {
  await requireStaffUser();

  const { token } = await params;

  const registration =
    await prisma.professionalRegistration.findUnique({
      where: {
        checkInToken: token,
      },

      include: {
        event: true,
      },
    });

  if (!registration) {
    notFound();
  }

  //
  // Badge should only be issued after staff check-in.
  //
  if (
    registration.status !== "CHECKED_IN" ||
    !registration.checkedInAt
  ) {
    return (
      <main className="min-h-screen bg-[#090909] px-6 py-16 text-white">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-red-400">
            Badge Not Available
          </div>

          <h1 className="mt-4 text-3xl font-black">
            Check-In Required
          </h1>

          <p className="mt-4 leading-7 text-white/50">
            This professional must complete ASCEND event check-in
            before an accreditation badge can be printed.
          </p>

          <Link
            href={`/professional-checkin/${token}`}
            className="mt-7 inline-flex rounded-full border border-white/10 px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-white/60"
          >
            Return to Check-In
          </Link>
        </div>
      </main>
    );
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "";

  const accreditationUrl =
    `${appUrl}/professional-checkin/${token}`;

  const qrDataUrl =
    await QRCode.toDataURL(
      accreditationUrl,
      {
        width: 500,
        margin: 1,
        errorCorrectionLevel: "H",
      },
    );

  const role =
    registration.role.replaceAll("_", " ");

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
            href={`/professional-checkin/${token}`}
            className="text-sm font-semibold text-white/50 transition hover:text-white"
          >
            ← Check-In
          </Link>

          <PrintBadgeButton />
        </div>

        {/* PHYSICAL BADGE */}
        <section
          className="
            mx-auto
            flex
            h-[150mm]
            w-[100mm]
            flex-col
            overflow-hidden
            bg-white
            text-black
            shadow-2xl
            print:shadow-none
          "
        >
          {/* HEADER */}
          <div className="bg-black px-[8mm] pb-[5mm] pt-[7mm] text-white">
            <div className="text-[20px] font-black tracking-[0.28em]">
              ASCEND
            </div>

            <div className="mt-[1mm] text-[8px] font-bold uppercase tracking-[0.22em] text-white/55">
              Football Showcase
            </div>

            <div className="mt-[4mm] flex items-center justify-between border-t border-white/15 pt-[3mm]">
              <div className="text-[11px] font-black uppercase tracking-[0.1em] text-[#c7ff2f]">
                Lagos 2027
              </div>

              <div className="text-[8px] font-bold uppercase tracking-[0.1em] text-white/60">
                Professional Accreditation
              </div>
            </div>
          </div>

          {/* PHOTO */}
          <div className="flex justify-center px-[8mm] pt-[7mm]">
            <div className="h-[47mm] w-[47mm] overflow-hidden rounded-[4mm] border-[1.2mm] border-black bg-neutral-200">
              {registration.headshotUrl ? (
                <img
                  src={`/api/professional-registration/${registration.id}/headshot`}
                  alt={registration.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[9px] font-bold uppercase text-black/30">
                  No Photo
                </div>
              )}
            </div>
          </div>

          {/* IDENTITY */}
          <div className="px-[7mm] pt-[5mm] text-center">
            <div className="text-[21px] font-black uppercase leading-none">
              {registration.fullName}
            </div>

            <div className="mt-[3mm] bg-black px-[3mm] py-[2.5mm] text-[12px] font-black uppercase tracking-[0.08em] text-white">
              {role}
            </div>

            <div className="mt-[4mm] text-[8px] font-bold uppercase tracking-[0.14em] text-black/45">
              Accreditation Number
            </div>

            <div className="mt-[1mm] text-[15px] font-black tracking-[0.03em]">
              {registration.accreditationNumber}
            </div>
          </div>

          {/* QR */}
          <div className="mt-auto flex items-center gap-[5mm] border-t border-black/10 px-[7mm] py-[5mm]">
            <div className="h-[28mm] w-[28mm] shrink-0">
              <img
                src={qrDataUrl}
                alt="Professional accreditation QR"
                className="h-full w-full"
              />
            </div>

            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.08em]">
                Event Credential
              </div>

              <p className="mt-[1.5mm] text-[7px] leading-[1.45] text-black/55">
                This credential must be displayed while inside
                ASCEND controlled event areas.
              </p>

              <div className="mt-[2mm] text-[7px] font-bold uppercase tracking-[0.08em]">
                Scan to verify accreditation
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
