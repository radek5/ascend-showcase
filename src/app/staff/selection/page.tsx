import Link from "next/link";

import ShowcaseConfirmationButton from "./ShowcaseConfirmationButton";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

import {
  assignSelector,
  prepareForSelection,
  sendForSecondReview,
} from "./actions";

import { resendShowcaseConfirmation } from "./resendShowcaseConfirmation";

export default async function SelectionPage() {
  await requireStaffUser();

  const [applications, selectors] =
    await Promise.all([
      prisma.showcaseApplication.findMany({
        where: {
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

          assessmentFeePaid: true,

          registrationNumber: true,
          confirmationEmailSentAt: true,

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

  const selectedCount =
    applications.filter(
      (application) =>
        application.status === "SELECTED"
    ).length;

  const reserveCount =
    applications.filter(
      (application) =>
        application.status === "RESERVE"
    ).length;

  const reviewCount =
    applications.filter((application) =>
      [
        "VIDEO_REVIEW",
        "FINAL_REVIEW",
        "LONGLISTED",
      ].includes(application.status)
    ).length;

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10 bg-[#0b0b0b]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link
            href="/staff/dashboard"
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
              <span className="block text-lg font-semibold tracking-[0.32em]">
                ASCEND
              </span>

              <span className="block text-[10px] uppercase tracking-[0.22em] text-white/40">
                Selection Control
              </span>
            </div>
          </Link>

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
          Control anonymous assessment codes,
          selector assignments and football-selection
          outcomes. Player videos remain inside the
          separate Selector Portal.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          <Metric
            label="Under Review"
            value={reviewCount}
          />

          <Metric
            label="Selected"
            value={selectedCount}
          />

          <Metric
            label="Reserve"
            value={reserveCount}
          />
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-white/[0.04] text-[11px] font-black uppercase tracking-[0.12em] text-white/35">
                <tr>
                  <th className="px-5 py-4">
                    Player
                  </th>

                  <th className="px-5 py-4">
                    Assessment ID
                  </th>

                  <th className="px-5 py-4">
                    Videos
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4">
                    Selector Reviews
                  </th>

                  <th className="px-5 py-4">
                    Email
                  </th>

                  <th className="px-5 py-4">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {applications.map(
                  (application) => {
                    const completed =
                      application
                        .selectorAssignments
                        .filter(
                          (assignment) =>
                            assignment.status ===
                            "COMPLETED"
                        );

                    return (
                      <tr
                        key={application.id}
                        className="align-top"
                      >
                        <td className="px-5 py-5">
                          <div className="font-black">
                            {
                              application.firstName
                            }{" "}
                            {
                              application.lastName
                            }
                          </div>

                          <div className="mt-1 text-xs text-white/40">
                            {application.position ||
                              "Position —"}

                            {application.age
                              ? ` · Age ${application.age}`
                              : ""}
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          {application.assessmentCode ? (
                            <span className="font-mono text-sm font-black text-[#c7ff2f]">
                              {
                                application.assessmentCode
                              }
                            </span>
                          ) : (
                            <span className="text-sm text-white/30">
                              Not generated
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-5">
                          <span className="font-bold">
                            {
                              application.videos
                                .length
                            }
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <StatusBadge
                            value={
                              application.status
                            }
                          />
                        </td>

                        <td className="px-5 py-5">
                          {application
                            .selectorAssignments
                            .length === 0 ? (
                            <span className="text-sm text-white/30">
                              None
                            </span>
                          ) : (
                            <div className="space-y-2">
                              {application.selectorAssignments.map(
                                (
                                  assignment
                                ) => (
                                  <div
                                    key={
                                      assignment.id
                                    }
                                    className="text-xs"
                                  >
                                    <div className="font-bold">
                                      R
                                      {
                                        assignment.round
                                      }{" "}
                                      ·{" "}
                                      {
                                        assignment
                                          .selector
                                          .name
                                      }
                                    </div>

                                    <div className="mt-1 text-white/40">
                                      {
                                        assignment.status
                                      }

                                      {assignment
                                        .assessment
                                        ?.recommendation
                                        ? ` · ${assignment.assessment.recommendation.replaceAll(
                                            "_",
                                            " "
                                          )}`
                                        : ""}
                                    </div>
                                  </div>
                                )
                              )}

                              <div className="pt-1 text-[11px] text-white/35">
                                {
                                  completed.length
                                }{" "}
                                completed
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
        }).format(
          application.confirmationEmailSentAt,
        )}
      </div>

      <ShowcaseConfirmationButton
        applicationId={application.id}
        mode="resend"
      />
    </div>
  ) : application.assessmentFeePaid &&
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
                          {!application.assessmentCode ? (
                            <form
                              action={
                                prepareForSelection
                              }
                            >
                              <input
                                type="hidden"
                                name="applicationId"
                                value={
                                  application.id
                                }
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
                              {selectors.length >
                              0 ? (
                                <form
                                  action={
                                    assignSelector
                                  }
                                  className="flex min-w-[220px] gap-2"
                                >
                                  <input
                                    type="hidden"
                                    name="applicationId"
                                    value={
                                      application.id
                                    }
                                  />

                                  <select
                                    name="selectorId"
                                    required
                                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-xs text-white"
                                    defaultValue=""
                                  >
                                    <option value="">
                                      Assign selector
                                    </option>

                                    {selectors.map(
                                      (
                                        selector
                                      ) => (
                                        <option
                                          key={
                                            selector.id
                                          }
                                          value={
                                            selector.id
                                          }
                                        >
                                          {
                                            selector.name
                                          }
                                        </option>
                                      )
                                    )}
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
                                  No active selectors
                                  configured.
                                </div>
                              )}

                              {completed.length >
                              0 ? (
                                <form
                                  action={
                                    sendForSecondReview
                                  }
                                >
                                  <input
                                    type="hidden"
                                    name="applicationId"
                                    value={
                                      application.id
                                    }
                                  />

                                  <button
                                    type="submit"
                                    className="text-xs font-bold text-white/45 hover:text-white"
                                  >
                                    Send for another
                                    review
                                  </button>
                                </form>
                              ) : null}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}

                {applications.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-14 text-center text-sm text-white/35"
                    >
                      No applications are
                      currently in the selection
                      workflow.
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

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
      <div className="text-xs font-black uppercase tracking-[0.12em] text-white/35">
        {label}
      </div>

      <div className="mt-3 text-4xl font-black">
        {value}
      </div>
    </div>
  );
}

function StatusBadge({
  value,
}: {
  value: string;
}) {
  return (
    <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.06em] text-white/60">
      {value.replaceAll("_", " ")}
    </span>
  );
}
