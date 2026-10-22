import Link from "next/link";

import { requireVerifiedApplicantUser } from "@/lib/applicants/auth";
import { getSelectedPlayerInvitation } from "@/lib/applicants/selectedPlayerInvitation";
import { hashSecureToken } from "@/lib/applicants/tokens";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SelectedInvitationPage() {
  const applicantUser = await requireVerifiedApplicantUser();
  const token = await getSelectedPlayerInvitation();

  const invitation = token
    ? await prisma.showcaseSelectedPlayer.findFirst({
        where: {
          eventSlug: "lagos-2027",
          registrationTokenHash: hashSecureToken(token),
          footballSelected: true,
          registrationTokenUsedAt: { not: null },
          registeredApplicantUserId: applicantUser.id,
          matchedApplicationId: null,
          registrationTokenExpiresAt: {
            gt: new Date(),
          },
        },
        select: {
          fullName: true,
          reportedAge: true,
          position: true,
        },
      })
    : null;

  return (
    <main className="min-h-screen bg-[#090909] px-6 py-16 text-white">
      <section className="mx-auto max-w-2xl">
        <p className="text-sm font-black uppercase tracking-widest text-[#c7ff2f]">
          REVELATIONX1 · Lagos 2026
        </p>

        <h1 className="mt-5 text-3xl font-black">Selected Player Invitation</h1>

        {!invitation ? (
          <>
            <p className="mt-6 text-white/70">
              No valid pending invitation was found. Your link may have expired
              or already been claimed.
            </p>
            <Link href="/account" className="mt-6 inline-block underline">
              Return to account
            </Link>
          </>
        ) : (
          <>
            <div className="mt-8 rounded-2xl border border-[#c7ff2f]/30 p-6">
              <p className="text-sm text-white/50">Invited player</p>
              <p className="mt-2 text-2xl font-black">{invitation.fullName}</p>

              <p className="mt-4 text-white/70">
                Position: {invitation.position}
              </p>

              <p className="mt-2 text-white/70">
                Reported age: {invitation.reportedAge ?? "Not recorded"}
              </p>
            </div>

            <p className="mt-6 text-sm leading-7 text-white/70">
              You are signed in as {applicantUser.email}. Confirm that this
              invitation belongs to you before continuing. Registration,
              identity verification and any required safeguarding checks must
              still be completed.
            </p>

            <p className="mt-4 text-sm leading-7 text-amber-200">
              Your invitation will be linked to your application when you submit
              your player details. Confirming here does not complete
              registration or establish identity clearance.
            </p>

            <Link
              href="/apply/lagos-2027/start"
              className="mt-6 inline-flex rounded-full bg-[#c7ff2f] px-6 py-3 text-sm font-black text-black"
            >
              Confirm Invitation &amp; Continue Registration
            </Link>

            <Link
              href="/account"
              className="mt-8 inline-block rounded-full border border-white/20 px-6 py-3 font-bold"
            >
              Back to My Account
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
