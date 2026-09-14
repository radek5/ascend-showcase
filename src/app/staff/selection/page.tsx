import Link from "next/link";

import ShowcaseConfirmationButton from "./ShowcaseConfirmationButton";
import ShowcaseSelectionInvitationButton from "./ShowcaseSelectionInvitationButton";
import RevelationX1Logo from "@/components/brand/RevelationX1Logo";
import ReleaseSelectionDecisionsButton from "./ReleaseSelectionDecisionsButton";
import SendSelectionOutcomesButton from "./SendSelectionOutcomesButton";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

import {
  assignSelector,
  prepareForSelection,
  sendForSecondReview,
  setFinalSelectionDecision,
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
    throw new Error("Lagos 2027 showcase event not found.");
  }

  const [applications, selectors] = await Promise.all([
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
  ]);

  const selectedCount = applications.filter(
    (application) => application.status === "SELECTED",
  ).length;

  const reserveCount = applications.filter(
    (application) => application.status === "RESERVE",
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
          Lagos 2027
        </div>

        <h1 className="mt-3 text-4xl font-black sm:text-5xl">
          Selection Control
        </h1>

        <p className="mt-4 max-w-3xl text-white/50">
          Control anonymous assessment codes, selector assignments and
          football-selection outcomes. Player videos remain inside the separate
          Selector Portal.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
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
            label="Reserve"
            value={
              reserveCapacity !== null
                ? `${reserveCount} / ${reserveCapacity}`
                : reserveCount
            }
          />

          <Metric label="Places Left" value={selectedPlacesLeft ?? "—"} />

          <Metric label="Reserve Left" value={reservePlacesLeft ?? "—"} />
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
          {decisionsReleased ? (
            <div>
              <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
                Decisions Released
              </div>

              <div className="mt-2 text-lg font-black text-white">
                Lagos 2027 player outcomes are official
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
                  The Lagos 2027 selection cut is complete
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

                  <th className="px-5 py-4">Assessment ID</th>

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

                        <div className="mt-1 text-xs text-white/40">
                          {application.position || "Position —"}

                          {application.age ? ` · Age ${application.age}` : ""}
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        {application.assessmentCode ? (
                          <span className="font-mono text-sm font-black text-[#c7ff2f]">
                            {application.assessmentCode}
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
                        {!application.assessmentCode ? (
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
