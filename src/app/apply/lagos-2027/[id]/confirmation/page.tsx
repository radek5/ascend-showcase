import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";

import RevelationX1Logo from "@/components/brand/RevelationX1Logo";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ConfirmationPage({ params }: PageProps) {
  const { id } = await params;

  const application = await prisma.showcaseApplication.findUnique({
    where: {
      id,
    },

    select: {
      id: true,
      eventSlug: true,

      firstName: true,
      lastName: true,

      status: true,
      submittedAt: true,

      registrationNumber: true,
      checkInToken: true,
    },
  });

  if (!application) {
    notFound();
  }

  /*
   * ----------------------------------------------------------
   * SUBMISSION GUARD
   * ----------------------------------------------------------
   *
   * The confirmation page is only available after the
   * application has been formally submitted.
   *
   * Submission is independent of payment.
   */

  if (!application.submittedAt) {
    redirect(`/apply/${application.eventSlug}/${application.id}/review`);
  }

  /*
   * ----------------------------------------------------------
   * PERMANENT REGISTRATION QR
   * ----------------------------------------------------------
   *
   * The QR is tied to the permanent check-in token.
   *
   * The player's registration number and QR remain unchanged
   * regardless of later assessment or selection status.
   */

  let qrDataUrl: string | null = null;

  if (application.checkInToken) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (appUrl) {
      const qrUrl = `${appUrl}/checkin/${application.checkInToken}`;

      qrDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 360,
        margin: 2,
        errorCorrectionLevel: "H",
      });
    }
  }

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <RevelationX1Logo />

          <Link
            href="/"
            className="text-sm font-medium text-white/60 transition hover:text-white"
          >
            Back to Event
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
        <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#c7ff2f]">
          Step 8 of 8
        </div>

        <div className="mt-6 rounded-[2rem] border border-[#c7ff2f]/25 bg-[#c7ff2f]/[0.04] p-8 sm:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#c7ff2f] text-2xl font-black text-black">
            ✓
          </div>

          <h1 className="mt-6 text-4xl font-black sm:text-5xl">
            Application Submitted
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-white/60">
            Thank you, {application.firstName}. Your application for the Lagos
            2027 Men&apos;s Football Showcase and your submitted football
            evidence have been received.
          </p>

          <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-5">
            <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
              Application Received
            </div>

            <p className="mt-2 text-sm leading-6 text-white/60">
              Your application will now enter the eligibility and football
              assessment process. Submission does not mean that you have been
              selected for the Showcase.
            </p>
          </div>

          {application.registrationNumber && (
            <div className="mt-8 rounded-2xl border border-[#c7ff2f]/25 bg-black/30 p-6">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-white/40">
                Your Permanent Registration Code
              </div>

              <div className="mt-3 break-words text-2xl font-black tracking-[0.08em] text-[#c7ff2f] sm:text-3xl">
                {application.registrationNumber}
              </div>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
                Keep this registration code safe. It remains your permanent
                Lagos 2027 Men&apos;s Football Showcase registration identity
                throughout the application, assessment and selection process.
              </p>
            </div>
          )}

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <SummaryItem
              label="Player"
              value={`${application.firstName} ${application.lastName}`}
            />

            <SummaryItem
              label="Application Status"
              value="Submitted — Under Assessment"
            />
          </div>
        </div>

        {application.registrationNumber && qrDataUrl && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.16em] text-[#c7ff2f]">
                  Your REVELATIONX1 Registration QR
                </div>

                <h2 className="mt-3 text-2xl font-black">Keep this QR code</h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-white/55">
                  This QR code is permanently linked to your REVELATIONX1 Lagos
                  2027 registration.
                </p>

                <div className="mt-5 rounded-xl border border-[#c7ff2f]/20 bg-[#c7ff2f]/[0.05] p-4">
                  <p className="text-sm font-bold leading-6 text-white/80">
                    Your registration code and QR code will remain the same
                    throughout the application and selection process.
                  </p>
                </div>

                <div className="mt-5 text-sm text-white/40">
                  Registration Code
                </div>

                <div className="mt-1 font-black tracking-[0.06em] text-[#c7ff2f]">
                  {application.registrationNumber}
                </div>
              </div>

              <div className="flex justify-center md:justify-end">
                <div className="rounded-2xl bg-white p-4">
                  <img
                    src={qrDataUrl}
                    width={220}
                    height={220}
                    alt={`REVELATIONX1 registration QR for ${application.registrationNumber}`}
                    className="h-[220px] w-[220px]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
          <div className="text-lg font-black">What happens next?</div>

          <div className="mt-5 space-y-5 text-sm leading-7 text-white/55">
            <p>
              Your application will now enter REVELATIONX1&apos;s identity, age
              and event eligibility verification process. Lagos 2027 is the
              Men&apos;s Football Showcase for eligible male players aged 18–20
              on the first day of the programme.
            </p>

            <p>
              REVELATIONX1 will review the identity documents and information
              submitted with your application before your football evidence is
              released for assessment.
            </p>

            <p>
              Once your application has passed the required eligibility checks,
              your submitted football videos may be reviewed by authorised
              REVELATIONX1 selectors.
            </p>

            <p>
              If further football evidence or information is required,
              REVELATIONX1 may contact you before a final decision is made.
            </p>

            <p className="font-bold text-white">
              The best 100 eligible players will be selected for the final Lagos
              2027 Men&apos;s Football Showcase.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-6">
          <div className="text-xs font-black uppercase tracking-[0.16em] text-amber-300">
            Important
          </div>

          <p className="mt-3 text-sm leading-7 text-white/60">
            Submission of an application does not guarantee selection or an
            invitation to the Lagos 2027 Men&apos;s Football Showcase. Places
            cannot be purchased and selection is based on eligibility and
            football assessment.
          </p>
        </div>

        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90"
          >
            Return to REVELATIONX1
          </Link>
        </div>
      </section>
    </main>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="text-xs font-black uppercase tracking-[0.08em] text-white/35">
        {label}
      </div>

      <div className="mt-2 break-words text-sm font-bold text-white/75">
        {value}
      </div>
    </div>
  );
}
