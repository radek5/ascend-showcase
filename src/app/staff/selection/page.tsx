import GenerateWhatsAppInvitationButton from "./GenerateWhatsAppInvitationButton";
import PlayerActionsDropdown from "./PlayerActionsDropdown";
import Link from "next/link";

import ShowcaseConfirmationButton from "./ShowcaseConfirmationButton";
import ShowcaseSelectionInvitationButton from "./ShowcaseSelectionInvitationButton";
import RevelationX1Logo from "@/components/brand/RevelationX1Logo";
import ReleaseSelectionDecisionsButton from "./ReleaseSelectionDecisionsButton";
import SendSelectionOutcomesButton from "./SendSelectionOutcomesButton";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

import {
  addPreSelectedPlayer,
  assignSelector,
  prepareForSelection,
  promoteReservePlayer,
  revokeVideoExemption,
  restoreVideoExemption,
  sendForSecondReview,
  setFinalSelectionDecision,
  withdrawSelectedPlayer,
} from "./actions";

export default async function SelectionPage() {
  const staffUser = await requireStaffUser();

  const event = await prisma.event.findUnique({
    where: {
      slug: "lagos-2027",
    },

    select: {
      id: true,
      edition: true,
      slug: true,
      capacity: true,
      reserveCapacity: true,
      selectionDecisionsReleasedAt: true,
    },
  });

  if (!event) {
    throw new Error("Lagos 2026 showcase event not found.");
  }

  const [applications, selectors, preSelectedPlayers] = await Promise.all([
    prisma.showcaseApplication.findMany({
      where: {
        eventSlug: event.slug,

        status: {
          in: [
            "SUBMITTED",
            "ELIGIBILITY_REVIEW",
            "VIDEO_REVIEW",
            "LONGLISTED",
            "FINAL_REVIEW",
            "SELECTED",
            "RESERVE",
            "NOT_SELECTED",
            "WITHDRAWN",
          ],
        },
      },

      orderBy: {
        createdAt: "asc",
      },

      select: {
        id: true,

        firstName: true,
        lastName: true,

        age: true,
        position: true,

        status: true,
        assessmentCode: true,

        submittedAt: true,

        registrationNumber: true,
        confirmationEmailSentAt: true,

        selectionDecisionReleasedAt: true,
        selectionOutcomeEmailSentAt: true,
        selectionInvitationSentAt: true,

        selectionResponse: true,
        selectionResponseAt: true,

        reserveRank: true,
        reservePromotedAt: true,
        reservePromotionReason: true,

        selectionExitAt: true,
        selectionExitReason: true,
        selectionExitNotes: true,

        videos: {
          where: {
            status: {
              in: ["SUBMITTED", "PROCESSING", "READY"],
            },
          },
          select: {
            id: true,
          },
        },

        selectorAssignments: {
          orderBy: [
            {
              round: "asc",
            },
            {
              assignedAt: "asc",
            },
          ],

          select: {
            id: true,
            round: true,
            status: true,

            selector: {
              select: {
                id: true,
                name: true,
                staffUserId: true,
              },
            },

            assessment: {
              select: {
                recommendation: true,
                submittedAt: true,

                technical: true,
                tactical: true,
                physical: true,
                positioning: true,
                decisionMaking: true,
                potential: true,
              },
            },
          },
        },
      },
    }),

    prisma.selectorAccount.findMany({
      where: {
        active: true,
      },

      orderBy: {
        name: "asc",
      },

      select: {
        id: true,
        name: true,
        email: true,
        staffUserId: true,
      },
    }),

    prisma.showcaseSelectedPlayer.findMany({
      where: {
        eventSlug: event.slug,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        fullName: true,
        reportedAge: true,
        position: true,
        whatsappNumber: true,
        batchCode: true,
        registrationTokenHash: true,
        registrationTokenExpiresAt: true,
        registrationTokenUsedAt: true,
        registeredApplicantUserId: true,
        matchedApplication: {
          select: {
            registrationNumber: true,
          },
        },
      },
    }),
  ]);

  const awaitingPreSelectedPlayers = preSelectedPlayers.filter(
    (player) => !player.registeredApplicantUserId,
  ).length;

  const registeredPreSelectedPlayers = preSelectedPlayers.filter((player) =>
    Boolean(player.registeredApplicantUserId),
  ).length;

  const selectedCount = applications.filter(
    (application) => application.status === "SELECTED",
  ).length;

  const reserveCount = applications.filter(
    (application) => application.status === "RESERVE",
  ).length;

  const withdrawnCount = applications.filter(
    (application) => application.status === "WITHDRAWN",
  ).length;

  const reviewCount = applications.filter((application) =>
    [
      "SUBMITTED",
      "ELIGIBILITY_REVIEW",
      "VIDEO_REVIEW",
      "LONGLISTED",
      "FINAL_REVIEW",
    ].includes(application.status),
  ).length;

  const selectedCapacity = event.capacity;

  const reserveCapacity = event.reserveCapacity;

  const selectedPlacesLeft =
    selectedCapacity !== null
      ? Math.max(selectedCapacity - selectedCount, 0)
      : null;

  const reservePlacesLeft =
    reserveCapacity !== null
      ? Math.max(reserveCapacity - reserveCount, 0)
      : null;

  const decisionsReleased = Boolean(event.selectionDecisionsReleasedAt);

  const releasedOutcomeApplications = applications.filter(
    (application) =>
      application.selectionDecisionReleasedAt &&
      ["SELECTED", "RESERVE", "NOT_SELECTED"].includes(application.status),
  );

  const outcomeEmailsSent = releasedOutcomeApplications.filter(
    (application) => application.selectionOutcomeEmailSentAt,
  ).length;

  const outcomeEmailsPending =
    releasedOutcomeApplications.length - outcomeEmailsSent;

  const selectionReady =
    !decisionsReleased &&
    selectedCapacity !== null &&
    selectedCapacity > 0 &&
    selectedCount === selectedCapacity &&
    reviewCount === 0;

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10 bg-[#0b0b0b]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <div className="flex items-center gap-4">
            <RevelationX1Logo
              href="/staff/dashboard"
              variant="lockup"
              size="sm"
              theme="dark"
              descriptor="Selection Control"
            />
          </div>

          <Link
            href="/staff/dashboard"
            className="text-sm font-semibold text-white/50 hover:text-white"
          >
            ← Back Office
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
          Lagos 2026
        </div>

        <h1 className="mt-3 text-4xl font-black sm:text-5xl">
          Selection Control
        </h1>

        <p className="mt-4 max-w-3xl text-white/50">
          Manage player reviews, selector assignments, assessments and
          football-selection outcomes in one place.
        </p>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
                Player Invitations
              </div>
              <h2 className="mt-2 text-2xl font-black text-white">
                Pre-selected Players
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
                Add pre-selected players and manage their registration
                invitations. Players provide their remaining details during
                registration.
              </p>
            </div>
            <div className="flex gap-3 text-sm">
              <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                <span className="text-white/40">Awaiting </span>
                <span className="font-black text-white">
                  {awaitingPreSelectedPlayers}
                </span>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                <span className="text-white/40">Registered </span>
                <span className="font-black text-white">
                  {registeredPreSelectedPlayers}
                </span>
              </div>
            </div>
          </div>

          <form
            action={addPreSelectedPlayer}
            className="mt-6 grid gap-4 border-t border-white/10 pt-6 lg:grid-cols-[1fr_1fr_auto]"
          >
            <div>
              <label
                htmlFor="preselected-name"
                className="text-xs font-black uppercase tracking-[0.08em] text-white/40"
              >
                Full Name
              </label>
              <input
                id="preselected-name"
                name="fullName"
                type="text"
                required
                maxLength={150}
                placeholder="Player's full name"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#c7ff2f]/60"
              />
            </div>
            <div>
              <label
                htmlFor="preselected-whatsapp"
                className="text-xs font-black uppercase tracking-[0.08em] text-white/40"
              >
                WhatsApp Number
              </label>
              <input
                id="preselected-whatsapp"
                name="whatsappNumber"
                type="tel"
                required
                maxLength={25}
                placeholder="+234..."
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#c7ff2f]/60"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-xl bg-[#c7ff2f] px-5 py-3 text-sm font-black text-black transition hover:bg-white lg:w-auto"
              >
                Add Player
              </button>
            </div>
          </form>

          <div className="mt-7 overflow-x-auto border-t border-white/10 pt-6">
            {preSelectedPlayers.length === 0 ? (
              <p className="py-6 text-center text-sm text-white/35">
                No pre-selected players have been added yet.
              </p>
            ) : (
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-black uppercase text-white/35">
                    <th className="px-3 py-3">Player</th>
                    <th className="px-3 py-3">WhatsApp</th>
                    <th className="px-3 py-3">Invitation</th>
                    <th className="px-3 py-3">Account</th>
                    <th className="px-3 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {preSelectedPlayers.map((player) => (
                    <tr
                      key={player.id}
                      className="border-b border-white/[0.06]"
                    >
                      <td className="px-3 py-4 font-bold text-white">
                        {player.fullName}
                      </td>
                      <td className="px-3 py-4 text-white/60">
                        {player.whatsappNumber || "—"}
                      </td>
                      <td className="px-3 py-4 text-white/60">
                        {player.registrationTokenUsedAt
                          ? "Used"
                          : !player.registrationTokenHash
                            ? "Not generated"
                            : player.registrationTokenExpiresAt &&
                                player.registrationTokenExpiresAt <= new Date()
                              ? "Expired"
                              : "Active"}
                      </td>
                      <td className="px-3 py-4 text-white/60">
                        {player.registeredApplicantUserId
                          ? "Registered"
                          : "Not registered"}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <PlayerActionsDropdown
                            playerId={player.id}
                            playerName={player.fullName}
                            fullName={player.fullName}
                            reportedAge={player.reportedAge}
                            position={player.position}
                            whatsappNumber={player.whatsappNumber}
                          />
                          {!player.registrationTokenHash &&
                          !player.registeredApplicantUserId &&
                          player.whatsappNumber ? (
                            <GenerateWhatsAppInvitationButton
                              playerId={player.id}
                              whatsappNumber={player.whatsappNumber}
                            />
                          ) : (
                            <span className="text-white/35">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {decisionsReleased ? (
            <>
              <Metric
                label="Selected"
                value={
                  selectedCapacity !== null
                    ? `${selectedCount} / ${selectedCapacity}`
                    : selectedCount
                }
              />

              <Metric label="Vacancies" value={selectedPlacesLeft ?? "—"} />

              <Metric
                label="Standby"
                value={
                  reserveCapacity !== null
                    ? `${reserveCount} / ${reserveCapacity}`
                    : reserveCount
                }
              />

              <Metric label="Withdrawn" value={withdrawnCount} />

              <Metric
                label="Standby Places Left"
                value={reservePlacesLeft ?? "—"}
              />
            </>
          ) : (
            <>
              <Metric label="Under Review" value={reviewCount} />

              <Metric
                label="Selected"
                value={
                  selectedCapacity !== null
                    ? `${selectedCount} / ${selectedCapacity}`
                    : selectedCount
                }
              />

              <Metric
                label="Standby"
                value={
                  reserveCapacity !== null
                    ? `${reserveCount} / ${reserveCapacity}`
                    : reserveCount
                }
              />

              <Metric label="Places Left" value={selectedPlacesLeft ?? "—"} />

              <Metric
                label="Standby Places Left"
                value={reservePlacesLeft ?? "—"}
              />
            </>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
          {decisionsReleased ? (
            <div>
              <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
                Decisions Released
              </div>

              <div className="mt-2 text-lg font-black text-white">
                Lagos 2026 player outcomes are official
              </div>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/45">
                The selection cut has been released and new applications are
                closed. Draft selection decisions can no longer be revised
                through the initial selection workflow.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs font-black uppercase tracking-[0.08em] text-white/35">
                    Released Outcomes
                  </div>

                  <div className="mt-2 text-2xl font-black text-white">
                    {releasedOutcomeApplications.length}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs font-black uppercase tracking-[0.08em] text-white/35">
                    Notifications Sent
                  </div>

                  <div className="mt-2 text-2xl font-black text-white">
                    {outcomeEmailsSent}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs font-black uppercase tracking-[0.08em] text-white/35">
                    Notifications Pending
                  </div>

                  <div className="mt-2 text-2xl font-black text-white">
                    {outcomeEmailsPending}
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-white/10 pt-6">
                <div className="mb-4">
                  <div className="text-sm font-black text-white">
                    Player Outcome Notifications
                  </div>

                  <p className="mt-1 max-w-3xl text-sm leading-6 text-white/45">
                    Send the official released outcome to players who have not
                    yet been notified. Selected-player emails contain the offer
                    only; event credentials remain separate.
                  </p>
                </div>

                {staffUser.role === "ADMIN" ? (
                  <SendSelectionOutcomesButton
                    eventSlug={event.slug}
                    pendingCount={outcomeEmailsPending}
                  />
                ) : (
                  <div className="text-xs font-bold text-white/35">
                    An administrator must send player outcome notifications.
                  </div>
                )}
              </div>
            </div>
          ) : selectionReady ? (
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
                  Ready to Release
                </div>

                <div className="mt-2 text-lg font-black text-white">
                  The Lagos 2026 selection cut is complete
                </div>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-white/45">
                  {selectedCount} players are selected and there are no
                  unresolved applications in the selection workflow. Releasing
                  decisions will make these outcomes official and close new
                  applications.
                </p>
              </div>

              {staffUser.role === "ADMIN" ? (
                <ReleaseSelectionDecisionsButton eventSlug={event.slug} />
              ) : (
                <div className="text-xs font-bold text-white/35">
                  An administrator must release the decisions.
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="text-xs font-black uppercase tracking-[0.12em] text-white/35">
                Selection In Progress
              </div>

              <div className="mt-2 text-lg font-black text-white">
                Final outcomes are still being prepared
              </div>

              <p className="mt-2 text-sm leading-6 text-white/45">
                {selectedCapacity !== null
                  ? `${selectedCount} of ${selectedCapacity} showcase places have been filled.`
                  : "Showcase capacity has not been configured."}
                {reviewCount > 0
                  ? ` ${reviewCount} application${reviewCount === 1 ? "" : "s"} still require a final outcome.`
                  : ""}
              </p>
            </div>
          )}
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-white/[0.04] text-[11px] font-black uppercase tracking-[0.12em] text-white/35">
                <tr>
                  <th className="px-5 py-4">Player</th>

                  <th className="px-5 py-4">Player ID</th>

                  <th className="px-5 py-4">Videos</th>

                  <th className="px-5 py-4">Status</th>

                  <th className="px-5 py-4">Selector Reviews</th>

                  <th className="px-5 py-4">Application Email</th>

                  <th className="px-5 py-4">Selection Invitation</th>

                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {applications.map((application) => {
                  const completed = application.selectorAssignments.filter(
                    (assignment) => assignment.status === "COMPLETED",
                  );

                  return (
                    <tr key={application.id} className="align-top">
                      <td className="px-5 py-5">
                        <div className="font-black">
                          {application.firstName} {application.lastName}
                        </div>

                        <Link
                          href={`/staff/registrations/${application.id}`}
                          className="mt-2 inline-block text-xs font-bold text-[#c7ff2f] hover:underline"
                        >
                          Edit Profile
                        </Link>

                        <div className="mt-1 text-xs text-white/40">
                          {application.position || "Position —"}

                          {application.age ? ` · Age ${application.age}` : ""}
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        {application.assessmentCode ? (
                          <span className="font-mono text-sm font-black text-[#c7ff2f]">
                            {application.registrationNumber}
                          </span>
                        ) : (
                          <span className="text-sm text-white/30">
                            Not generated
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-5">
                        <span className="font-bold">
                          {application.videos.length}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <StatusBadge value={application.status} />
                      </td>

                      <td className="px-5 py-5">
                        {application.selectorAssignments.length === 0 ? (
                          <span className="text-sm text-white/30">None</span>
                        ) : (
                          <div className="space-y-2">
                            {application.selectorAssignments.map(
                              (assignment) => (
                                <div key={assignment.id} className="text-xs">
                                  <div className="font-bold">
                                    R{assignment.round} ·{" "}
                                    {assignment.selector.name}
                                  </div>

                                  <div className="mt-1 text-white/40">
                                    {assignment.status}

                                    {assignment.assessment?.recommendation
                                      ? ` · ${assignment.assessment.recommendation.replaceAll(
                                          "_",
                                          " ",
                                        )}`
                                      : ""}
                                  </div>

                                  {assignment.selector.staffUserId ===
                                    staffUser.id &&
                                  assignment.status !== "CANCELLED" ? (
                                    <Link
                                      href={`/selectors/enter?assignmentId=${assignment.id}`}
                                      className="mt-2 inline-flex text-[11px] font-black uppercase tracking-[0.08em] text-[#c7ff2f] transition hover:opacity-75"
                                    >
                                      {assignment.status === "COMPLETED"
                                        ? "View Assessment"
                                        : "Open Assessment"}
                                    </Link>
                                  ) : null}
                                </div>
                              ),
                            )}

                            <div className="pt-1 text-[11px] text-white/35">
                              {completed.length} completed
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-5">
                        {application.confirmationEmailSentAt ? (
                          <div>
                            <div className="text-xs font-black uppercase tracking-[0.06em] text-[#c7ff2f]">
                              Sent
                            </div>

                            <div className="mt-1 text-[11px] text-white/35">
                              {new Intl.DateTimeFormat("en-GB", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }).format(application.confirmationEmailSentAt)}
                            </div>

                            <ShowcaseConfirmationButton
                              applicationId={application.id}
                              mode="resend"
                            />
                          </div>
                        ) : application.submittedAt &&
                          application.registrationNumber ? (
                          <div>
                            <div className="text-xs font-bold text-amber-300">
                              Not sent
                            </div>

                            <ShowcaseConfirmationButton
                              applicationId={application.id}
                              mode="send"
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-white/30">
                            Not ready
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-5">
                        {application.status !== "SELECTED" ? (
                          <span className="text-xs text-white/30">—</span>
                        ) : !event.selectionDecisionsReleasedAt ||
                          !application.selectionDecisionReleasedAt ? (
                          <div>
                            <div className="text-xs font-bold text-white/35">
                              Decision not released
                            </div>

                            <div className="mt-1 text-[11px] text-white/25">
                              Invitation locked
                            </div>
                          </div>
                        ) : application.selectionInvitationSentAt ? (
                          <div>
                            <div className="text-xs font-black uppercase tracking-[0.06em] text-[#c7ff2f]">
                              Sent
                            </div>

                            <div className="mt-1 text-[11px] text-white/35">
                              {new Intl.DateTimeFormat("en-GB", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }).format(application.selectionInvitationSentAt)}
                            </div>

                            <ShowcaseSelectionInvitationButton
                              applicationId={application.id}
                              mode="resend"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="text-xs font-bold text-amber-300">
                              Not sent
                            </div>

                            <ShowcaseSelectionInvitationButton
                              applicationId={application.id}
                              mode="send"
                            />
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-5">
                        {decisionsReleased ? (
                          <div className="min-w-[250px]">
                            {application.status === "SELECTED" ? (
                              <div className="space-y-3">
                                <div>
                                  <div className="text-[10px] font-black uppercase tracking-[0.08em] text-white/30">
                                    Place Response
                                  </div>

                                  <div className="mt-1 text-xs font-black text-white">
                                    {application.selectionResponse
                                      ? application.selectionResponse.replaceAll(
                                          "_",
                                          " ",
                                        )
                                      : "PENDING"}
                                  </div>

                                  {application.selectionResponseAt ? (
                                    <div className="mt-1 text-[11px] text-white/35">
                                      {new Intl.DateTimeFormat("en-GB", {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                      }).format(
                                        application.selectionResponseAt,
                                      )}
                                    </div>
                                  ) : null}
                                </div>

                                {application.reservePromotedAt ? (
                                  <div className="rounded-xl border border-[#c7ff2f]/15 bg-[#c7ff2f]/[0.04] p-3">
                                    <div className="text-[10px] font-black uppercase tracking-[0.08em] text-[#c7ff2f]">
                                      Promoted from Standby
                                    </div>

                                    <div className="mt-1 text-[11px] text-white/45">
                                      {application.reserveRank
                                        ? `Original standby position #${application.reserveRank}`
                                        : "Previously on standby"}
                                    </div>

                                    {application.reservePromotionReason ? (
                                      <div className="mt-1 text-[11px] text-white/35">
                                        {application.reservePromotionReason}
                                      </div>
                                    ) : null}
                                  </div>
                                ) : null}

                                <form
                                  action={withdrawSelectedPlayer}
                                  className="space-y-2 border-t border-white/10 pt-3"
                                >
                                  <input
                                    type="hidden"
                                    name="applicationId"
                                    value={application.id}
                                  />

                                  <div className="text-[10px] font-black uppercase tracking-[0.08em] text-white/30">
                                    Remove / Withdraw Place
                                  </div>

                                  <select
                                    name="reason"
                                    required
                                    defaultValue=""
                                    className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-xs text-white"
                                  >
                                    <option value="">Select reason</option>
                                    <option value="PLAYER_WITHDREW">
                                      Player withdrew
                                    </option>
                                    <option value="NO_RESPONSE">
                                      No response
                                    </option>
                                    <option value="ADMIN_REMOVED">
                                      Admin removed
                                    </option>
                                    <option value="INDUCTION_REMOVAL">
                                      Induction removal
                                    </option>
                                    <option value="OTHER">Other</option>
                                  </select>

                                  <textarea
                                    name="notes"
                                    rows={2}
                                    placeholder="Optional notes"
                                    className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-xs text-white placeholder:text-white/25"
                                  />

                                  <button
                                    type="submit"
                                    className="rounded-full border border-red-300/25 px-3 py-2 text-[10px] font-black uppercase tracking-[0.05em] text-red-200"
                                  >
                                    Remove Place
                                  </button>
                                </form>
                              </div>
                            ) : application.status === "RESERVE" ? (
                              <div className="space-y-3">
                                <div>
                                  <div className="text-[10px] font-black uppercase tracking-[0.08em] text-amber-200">
                                    Standby
                                  </div>

                                  <div className="mt-1 text-sm font-black text-white">
                                    {application.reserveRank
                                      ? `Position #${application.reserveRank}`
                                      : "Position not recorded"}
                                  </div>
                                </div>

                                {selectedPlacesLeft !== null &&
                                selectedPlacesLeft > 0 ? (
                                  <form
                                    action={promoteReservePlayer}
                                    className="space-y-2 border-t border-white/10 pt-3"
                                  >
                                    <input
                                      type="hidden"
                                      name="applicationId"
                                      value={application.id}
                                    />

                                    <label className="block text-[10px] font-black uppercase tracking-[0.08em] text-white/30">
                                      Promotion reason
                                    </label>

                                    <textarea
                                      name="reason"
                                      required
                                      rows={2}
                                      placeholder="Why is this standby player being promoted?"
                                      className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-xs text-white placeholder:text-white/25"
                                    />

                                    <button
                                      type="submit"
                                      className="rounded-full bg-[#c7ff2f] px-3 py-2 text-[10px] font-black uppercase tracking-[0.05em] text-black"
                                    >
                                      Promote to Selected
                                    </button>
                                  </form>
                                ) : (
                                  <div className="text-xs text-white/30">
                                    No vacancy available
                                  </div>
                                )}
                              </div>
                            ) : application.status === "WITHDRAWN" ? (
                              <div className="min-w-[220px]">
                                <div className="text-[10px] font-black uppercase tracking-[0.08em] text-red-200">
                                  Place Closed
                                </div>

                                <div className="mt-1 text-xs font-black text-white">
                                  {application.selectionExitReason
                                    ? application.selectionExitReason.replaceAll(
                                        "_",
                                        " ",
                                      )
                                    : "Withdrawn"}
                                </div>

                                {application.selectionExitAt ? (
                                  <div className="mt-1 text-[11px] text-white/35">
                                    {new Intl.DateTimeFormat("en-GB", {
                                      dateStyle: "medium",
                                      timeStyle: "short",
                                    }).format(application.selectionExitAt)}
                                  </div>
                                ) : null}

                                {application.selectionExitNotes ? (
                                  <div className="mt-2 text-xs leading-5 text-white/45">
                                    {application.selectionExitNotes}
                                  </div>
                                ) : null}

                                {application.selectionResponse ===
                                "DECLINED" ? (
                                  <div className="mt-2 text-[11px] font-bold text-amber-200">
                                    Player declined offer
                                  </div>
                                ) : null}
                              </div>
                            ) : application.status === "NOT_SELECTED" ? (
                              <div className="text-xs text-white/35">
                                Final outcome recorded
                              </div>
                            ) : (
                              <div className="text-xs text-white/30">
                                No post-release action
                              </div>
                            )}
                          </div>
                        ) : application.status !== "VIDEO_REVIEW" &&
                          application.status !== "FINAL_REVIEW" &&
                          application.status !== "LONGLISTED" ? (
                          <form action={prepareForSelection}>
                            <input
                              type="hidden"
                              name="applicationId"
                              value={application.id}
                            />

                            <button
                              type="submit"
                              className="rounded-full bg-[#c7ff2f] px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.06em] text-black"
                            >
                              Prepare
                            </button>
                          </form>
                        ) : (
                          <div className="space-y-3">
                            {selectors.length > 0 ? (
                              <form
                                action={assignSelector}
                                className="flex min-w-[220px] gap-2"
                              >
                                <input
                                  type="hidden"
                                  name="applicationId"
                                  value={application.id}
                                />

                                <select
                                  name="selectorId"
                                  required
                                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-xs text-white"
                                  defaultValue=""
                                >
                                  <option value="">Assign selector</option>

                                  {selectors.map((selector) => (
                                    <option
                                      key={selector.id}
                                      value={selector.id}
                                    >
                                      {selector.name}
                                    </option>
                                  ))}
                                </select>

                                <button
                                  type="submit"
                                  className="rounded-xl border border-[#c7ff2f]/35 px-3 py-2 text-xs font-black text-[#c7ff2f]"
                                >
                                  Assign
                                </button>
                              </form>
                            ) : (
                              <div className="text-xs text-amber-300">
                                No active selectors configured.
                              </div>
                            )}

                            {completed.length > 0 ? (
                              <form action={sendForSecondReview}>
                                <input
                                  type="hidden"
                                  name="applicationId"
                                  value={application.id}
                                />

                                <button
                                  type="submit"
                                  className="text-xs font-bold text-white/45 hover:text-white"
                                >
                                  Send for another review
                                </button>
                              </form>
                            ) : null}

                            {completed.length > 0 &&
                            [
                              "VIDEO_REVIEW",
                              "LONGLISTED",
                              "FINAL_REVIEW",
                              "SELECTED",
                              "RESERVE",
                              "NOT_SELECTED",
                            ].includes(application.status) ? (
                              <form
                                action={setFinalSelectionDecision}
                                className="border-t border-white/10 pt-3"
                              >
                                <input
                                  type="hidden"
                                  name="applicationId"
                                  value={application.id}
                                />

                                <div className="text-[10px] font-black uppercase tracking-[0.08em] text-white/30">
                                  {[
                                    "SELECTED",
                                    "RESERVE",
                                    "NOT_SELECTED",
                                  ].includes(application.status)
                                    ? "Revise Draft Decision"
                                    : "Draft Decision"}
                                </div>

                                <div className="mt-2 flex flex-wrap gap-2">
                                  <button
                                    type="submit"
                                    name="decision"
                                    value="SELECTED"
                                    className="rounded-full bg-[#c7ff2f] px-3 py-2 text-[10px] font-black uppercase tracking-[0.05em] text-black"
                                  >
                                    Select
                                  </button>

                                  <button
                                    type="submit"
                                    name="decision"
                                    value="RESERVE"
                                    className="rounded-full border border-amber-300/30 px-3 py-2 text-[10px] font-black uppercase tracking-[0.05em] text-amber-200"
                                  >
                                    Reserve
                                  </button>

                                  <button
                                    type="submit"
                                    name="decision"
                                    value="NOT_SELECTED"
                                    className="rounded-full border border-red-300/20 px-3 py-2 text-[10px] font-black uppercase tracking-[0.05em] text-red-200"
                                  >
                                    Not Selected
                                  </button>
                                </div>
                              </form>
                            ) : null}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {applications.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-14 text-center text-sm text-white/35"
                    >
                      No applications are currently in the selection workflow.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
      <div className="text-xs font-black uppercase tracking-[0.12em] text-white/35">
        {label}
      </div>

      <div className="mt-3 text-4xl font-black">{value}</div>
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.06em] text-white/60">
      {value.replaceAll("_", " ")}
    </span>
  );
}
