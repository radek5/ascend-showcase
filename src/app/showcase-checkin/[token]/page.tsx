import Link from "next/link";

import RevelationX1Logo from "@/components/brand/RevelationX1Logo";
import { prisma } from "@/lib/prisma";
import { getCurrentStaffUser } from "@/lib/staff/auth";

import { checkInShowcasePlayer } from "./actions";

export default async function ShowcasePlayerCheckInPage({
  params,
}: {
  params: Promise<{
    token: string;
  }>;
}) {
  const { token } = await params;

  const staffUser = await getCurrentStaffUser();

  if (!staffUser) {
    return (
      <main className="min-h-screen bg-[#090909] px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl">
          <RevelationX1Logo
            href=""
            size="md"
            theme="dark"
            descriptor="Football Showcase"
          />

          <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-[#c7ff2f]">
              Staff Authentication Required
            </div>

            <h1 className="mt-4 text-3xl font-black">Event Credential</h1>

            <p className="mt-4 text-white/55">
              This credential can only be viewed and processed by authorised
              REVELATIONX1 staff.
            </p>

            <Link
              href="/staff/login"
              className="mt-6 inline-flex rounded-full border border-white/15 px-6 py-3 text-xs font-black uppercase tracking-[0.1em] text-white transition hover:border-[#c7ff2f]/50"
            >
              Staff Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const application = await prisma.showcaseApplication.findUnique({
    where: {
      checkInToken: token,
    },

    select: {
      id: true,
      firstName: true,
      lastName: true,
      registrationNumber: true,
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
      checkedInAt: true,
      checkedInByStaffUserId: true,

      identityDocuments: {
        where: {
          type: "HEADSHOT",
        },

        select: {
          id: true,
          uploadedAt: true,
          storageKey: true,
        },

        take: 1,
      },
    },
  });

  if (!application) {
    return (
      <main className="min-h-screen bg-[#090909] px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[2rem] border border-red-500/20 bg-red-500/[0.05] p-8">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-red-400">
              Invalid Credential
            </div>

            <h1 className="mt-4 text-3xl font-black">
              Player Credential Not Found
            </h1>

            <p className="mt-4 text-white/55">
              This REVELATIONX1 player credential is invalid or no longer
              available.
            </p>
          </div>
        </div>
      </main>
    );
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

  const isSelected = application.status === "SELECTED";

  const headshot = application.identityDocuments[0];

  const hasHeadshot = Boolean(headshot?.storageKey && headshot.uploadedAt);

  const checkedInByStaff = application.checkedInByStaffUserId
    ? await prisma.staffUser.findUnique({
        where: {
          id: application.checkedInByStaffUserId,
        },

        select: {
          name: true,
          role: true,
        },
      })
    : null;

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <section className="border-b border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
          <RevelationX1Logo
            href=""
            size="md"
            theme="dark"
            descriptor="Football Showcase"
          />

          <div className="mt-8 text-xs font-bold uppercase tracking-[0.24em] text-[#c7ff2f]">
            Lagos 2027
          </div>

          <h1 className="mt-3 text-3xl font-black uppercase sm:text-4xl">
            Player Event Credential
          </h1>

          <p className="mt-3 text-white/50">
            Identity verification and event check-in.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
          {/* HEADSHOT */}
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-white/35">
              Player Photograph
            </div>

            <div className="mt-5 aspect-square overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/30">
              {hasHeadshot ? (
                <img
                  src={`/api/showcase-applications/${application.id}/headshot`}
                  alt={`${application.firstName} ${application.lastName} player headshot`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/30">
                  {staffUser
                    ? "Player headshot unavailable"
                    : "Staff login required to view identity photograph"}
                </div>
              )}
            </div>

            <div className="mt-5 text-xs leading-5 text-white/35">
              REVELATIONX1 staff must confirm that the player presenting this
              credential matches the photograph before completing check-in.
            </div>
          </div>

          {/* PLAYER DETAILS */}
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-[#c7ff2f]">
              Selected Player
            </div>

            <h2 className="mt-4 text-3xl font-black">
              {application.firstName} {application.lastName}
            </h2>

            <div className="mt-2 text-sm font-bold uppercase tracking-[0.1em] text-[#c7ff2f]">
              {application.position || "Player"}
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <div className="text-sm text-white/35">Registration number</div>

                <div className="mt-1 text-lg font-black">
                  {application.registrationNumber || "Not issued"}
                </div>
              </div>

              <div>
                <div className="text-sm text-white/35">Selection status</div>

                <div
                  className={`mt-1 text-lg font-black ${
                    isSelected ? "text-[#c7ff2f]" : "text-red-400"
                  }`}
                >
                  {application.status.replaceAll("_", " ")}
                </div>
              </div>
            </div>

            {application.checkedInAt ? (
              <div className="mt-8 rounded-2xl border border-[#c7ff2f]/20 bg-[#c7ff2f]/[0.06] p-6">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-[#c7ff2f]">
                  Already Checked In
                </div>

                <div className="mt-2 font-bold">
                  Player event access confirmed.
                </div>

                <div className="mt-2 text-sm text-white/45">
                  {new Intl.DateTimeFormat("en-GB", {
                    dateStyle: "full",
                    timeStyle: "short",
                    timeZone: "Africa/Lagos",
                  }).format(application.checkedInAt)}
                </div>

                {checkedInByStaff && (
                  <div className="mt-3 text-sm text-white/45">
                    Checked in by{" "}
                    <span className="font-semibold text-white">
                      {checkedInByStaff.name}
                    </span>
                    {" · "}
                    {checkedInByStaff.role}
                  </div>
                )}
              </div>
            ) : !credentialEligible ? (
              <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/[0.05] p-6">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-red-400">
                  Event Access Not Valid
                </div>

                <p className="mt-2 text-sm leading-6 text-white/55">
                  This player does not currently have a valid Lagos 2027 event
                  credential. Event entry requires a released selection
                  decision, an accepted place and completed Selected Player
                  Confirmation.
                </p>
              </div>
            ) : (
              <div className="mt-8">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-[#c7ff2f]">
                    Staff Verification
                  </div>

                  <div className="mt-3 text-sm text-white/55">
                    Signed in as:
                  </div>

                  <div className="mt-1 font-bold">{staffUser.name}</div>

                  <p className="mt-4 text-sm leading-6 text-white/45">
                    Confirm the player's identity against the photograph before
                    completing event check-in.
                  </p>
                </div>

                <form action={checkInShowcasePlayer}>
                  <input type="hidden" name="token" value={token} />

                  <button
                    type="submit"
                    className="mt-6 w-full rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90"
                  >
                    Confirm Check-In
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
