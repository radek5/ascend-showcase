"use server";

import { randomInt } from "crypto";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireStaffAdmin, requireStaffUser } from "@/lib/staff/auth";

async function createAssessmentCode() {
  /*
   * Anonymous football-assessment identifier.
   * The selector sees this code instead of the
   * applicant's name or personal information.
   */
  for (let attempt = 0; attempt < 20; attempt++) {
    const number = randomInt(1, 100000);

    const code = `LAG27-${number.toString().padStart(5, "0")}`;

    const exists = await prisma.showcaseApplication.findUnique({
      where: {
        assessmentCode: code,
      },
      select: {
        id: true,
      },
    });

    if (!exists) {
      return code;
    }
  }

  throw new Error("Unable to generate a unique assessment code.");
}

export async function prepareForSelection(formData: FormData) {
  await requireStaffUser();

  const applicationId = String(formData.get("applicationId") || "").trim();

  if (!applicationId) {
    throw new Error("Application ID missing.");
  }

  const application = await prisma.showcaseApplication.findUnique({
    where: {
      id: applicationId,
    },
    select: {
      id: true,
      assessmentCode: true,
      status: true,
    },
  });

  if (!application) {
    throw new Error("Application not found.");
  }

  const assessmentCode =
    application.assessmentCode || (await createAssessmentCode());

  await prisma.showcaseApplication.update({
    where: {
      id: application.id,
    },
    data: {
      assessmentCode,

      /*
       * Eventually ELIGIBILITY_REVIEW will be
       * completed before this action becomes
       * available.
       *
       * For the current build we move the
       * application into video review explicitly.
       */
      status: "VIDEO_REVIEW",
      eligibilityReviewedAt:
        application.status === "ELIGIBILITY_REVIEW" ? new Date() : undefined,
    },
  });

  revalidatePath("/staff/selection");
}

export async function assignSelector(formData: FormData) {
  await requireStaffUser();

  const applicationId = String(formData.get("applicationId") || "").trim();

  const selectorId = String(formData.get("selectorId") || "").trim();

  if (!applicationId || !selectorId) {
    throw new Error("Application and selector are required.");
  }

  const [application, selector] = await Promise.all([
    prisma.showcaseApplication.findUnique({
      where: {
        id: applicationId,
      },
      select: {
        id: true,
        assessmentCode: true,
        status: true,
      },
    }),

    prisma.selectorAccount.findUnique({
      where: {
        id: selectorId,
      },
      select: {
        id: true,
        active: true,
      },
    }),
  ]);

  if (!application) {
    throw new Error("Application not found.");
  }

  if (!selector || !selector.active) {
    throw new Error("Selector is not available.");
  }

  if (!application.assessmentCode) {
    throw new Error(
      "Generate the anonymous assessment code before assigning a selector.",
    );
  }

  if (
    application.status !== "VIDEO_REVIEW" &&
    application.status !== "FINAL_REVIEW" &&
    application.status !== "LONGLISTED"
  ) {
    throw new Error(
      "Application is not currently available for selector review.",
    );
  }

  /*
   * Determine which review round this selector
   * assignment belongs to.
   */
  const existingAssignments = await prisma.selectorAssignment.findMany({
    where: {
      applicationId,
    },
    select: {
      round: true,
    },
  });

  const currentRound =
    existingAssignments.length > 0
      ? Math.max(...existingAssignments.map((assignment) => assignment.round))
      : 1;

  const duplicate = await prisma.selectorAssignment.findFirst({
    where: {
      selectorId,
      applicationId,
      round: currentRound,
    },
  });

  if (duplicate) {
    throw new Error(
      "This player is already assigned to that selector for the current review round.",
    );
  }

  await prisma.selectorAssignment.create({
    data: {
      selectorId,
      applicationId,
      round: currentRound,
      status: "ASSIGNED",
    },
  });

  revalidatePath("/staff/selection");
  revalidatePath("/selectors");
  revalidatePath("/selectors/assignments");
}

export async function sendForSecondReview(formData: FormData) {
  await requireStaffUser();

  const applicationId = String(formData.get("applicationId") || "").trim();

  if (!applicationId) {
    throw new Error("Application ID missing.");
  }

  const application = await prisma.showcaseApplication.findUnique({
    where: {
      id: applicationId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!application) {
    throw new Error("Application not found.");
  }

  if (
    application.status !== "VIDEO_REVIEW" &&
    application.status !== "LONGLISTED" &&
    application.status !== "FINAL_REVIEW"
  ) {
    throw new Error(
      "Application is not currently available for another selector review.",
    );
  }

  const assignments = await prisma.selectorAssignment.findMany({
    where: {
      applicationId: application.id,
    },
    select: {
      round: true,
    },
  });

  const nextRound =
    assignments.length > 0
      ? Math.max(...assignments.map((assignment) => assignment.round)) + 1
      : 2;

  await prisma.showcaseApplication.update({
    where: {
      id: application.id,
    },
    data: {
      status: "FINAL_REVIEW",
    },
  });

  /*
   * Round itself is created when the manager
   * assigns the next selector.
   *
   * We preserve nextRound here for future audit/
   * assignment workflow expansion.
   */
  void nextRound;

  revalidatePath("/staff/selection");
}

export async function setFinalSelectionDecision(formData: FormData) {
  await requireStaffUser();

  const applicationId = String(formData.get("applicationId") || "").trim();

  const decision = String(formData.get("decision") || "").trim();

  if (!applicationId) {
    throw new Error("Application ID missing.");
  }

  if (
    decision !== "SELECTED" &&
    decision !== "RESERVE" &&
    decision !== "NOT_SELECTED"
  ) {
    throw new Error("Invalid selection decision.");
  }

  /*
   * First resolve the event slug.
   *
   * The actual decision is then performed inside a transaction
   * that locks the Event row. This makes the Event row the
   * concurrency mutex for selection-capacity decisions.
   */
  const applicationIdentity = await prisma.showcaseApplication.findUnique({
    where: {
      id: applicationId,
    },

    select: {
      id: true,
      eventSlug: true,
    },
  });

  if (!applicationIdentity) {
    throw new Error("Application not found.");
  }

  await prisma.$transaction(async (tx) => {
    /*
     * Lock the Event row before counting SELECTED / RESERVE players.
     *
     * All capacity-changing selection operations for this event
     * must use the same lock pattern. That prevents two staff users
     * from simultaneously creating player 100 and player 101.
     */
    const lockedEvents = await tx.$queryRaw<
      Array<{
        id: string;
        slug: string;
        capacity: number | null;
        reserveCapacity: number | null;
        selectionDecisionsReleasedAt: Date | null;
      }>
    >`
      SELECT
        "id",
        "slug",
        "capacity",
        "reserveCapacity",
        "selectionDecisionsReleasedAt"
      FROM "Event"
      WHERE "slug" = ${applicationIdentity.eventSlug}
      FOR UPDATE
    `;

    const event = lockedEvents[0];

    if (!event) {
      throw new Error("Showcase event not found.");
    }

    /*
     * Once decisions have been formally released, this action
     * must no longer be used to rewrite the initial cut.
     *
     * Post-release withdrawals and reserve promotions will have
     * their own controlled actions.
     */
    if (event.selectionDecisionsReleasedAt) {
      throw new Error(
        "Selection decisions for this event have already been released.",
      );
    }

    /*
     * Refetch the application inside the transaction so that
     * validation and the eventual update use current state.
     */
    const application = await tx.showcaseApplication.findUnique({
      where: {
        id: applicationId,
      },

      select: {
        id: true,
        eventSlug: true,
        status: true,

        selectorAssignments: {
          where: {
            status: "COMPLETED",
          },

          select: {
            id: true,

            assessment: {
              select: {
                submittedAt: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      throw new Error("Application not found.");
    }

    if (application.eventSlug !== event.slug) {
      throw new Error("Application does not belong to this showcase event.");
    }

    const editableStatuses = [
  "VIDEO_REVIEW",
  "LONGLISTED",
  "FINAL_REVIEW",
  "SELECTED",
  "RESERVE",
  "NOT_SELECTED",
];

if (!editableStatuses.includes(application.status)) {
  throw new Error(
    "Application is not currently available for a selection decision.",
  );
}

    const completedAssessments = application.selectorAssignments.filter(
      (assignment) => Boolean(assignment.assessment?.submittedAt),
    );

    if (completedAssessments.length === 0) {
      throw new Error(
        "At least one completed selector assessment is required before a final selection decision.",
      );
    }

    const decidedAt = new Date();

    if (application.status === decision) {
  return;
}

    /*
     * SELECTED
     *
     * Event.capacity is authoritative.
     * Lagos 2027 is currently configured for 100 places.
     */
    if (decision === "SELECTED") {
      if (!event.capacity || event.capacity < 1) {
        throw new Error(
          "A valid showcase capacity must be configured before players can be selected.",
        );
      }

      const selectedCount = await tx.showcaseApplication.count({
        where: {
          eventSlug: event.slug,
          status: "SELECTED",
        },
      });

      if (selectedCount >= event.capacity) {
        throw new Error(
          `The showcase selection capacity of ${event.capacity} players has already been reached.`,
        );
      }

      await tx.showcaseApplication.update({
        where: {
          id: application.id,
        },

        data: {
          status: "SELECTED",
          finalReviewedAt: decidedAt,
          selectedAt: decidedAt,

          /*
           * This is an initial selection decision, not a reserve
           * promotion and not yet a published decision.
           */
          reserveRank: null,
          reservePromotedAt: null,
          selectionResponse: null,
          selectionResponseAt: null,
          selectionResponseDeadline: null,
        },
      });

      return;
    }

    /*
     * RESERVE
     *
     * Reserve capacity is configured per Event rather than
     * hard-coded into the Lagos workflow.
     */
    if (decision === "RESERVE") {
      if (!event.reserveCapacity || event.reserveCapacity < 1) {
        throw new Error(
          "A reserve-list capacity must be configured before players can be placed on reserve.",
        );
      }

      const reserveCount = await tx.showcaseApplication.count({
        where: {
          eventSlug: event.slug,
          status: "RESERVE",
        },
      });

      if (reserveCount >= event.reserveCapacity) {
        throw new Error(
          `The reserve-list capacity of ${event.reserveCapacity} players has already been reached.`,
        );
      }

      const highestReserve = await tx.showcaseApplication.findFirst({
        where: {
          eventSlug: event.slug,
          reserveRank: {
            not: null,
          },
        },

        orderBy: {
          reserveRank: "desc",
        },

        select: {
          reserveRank: true,
        },
      });

      const nextReserveRank = (highestReserve?.reserveRank ?? 0) + 1;

      await tx.showcaseApplication.update({
        where: {
          id: application.id,
        },

        data: {
          status: "RESERVE",
          finalReviewedAt: decidedAt,
          selectedAt: null,

          reserveRank: nextReserveRank,
          reservePromotedAt: null,

          selectionResponse: null,
          selectionResponseAt: null,
          selectionResponseDeadline: null,
        },
      });

      return;
    }

    /*
     * NOT SELECTED
     */
    await tx.showcaseApplication.update({
      where: {
        id: application.id,
      },

      data: {
        status: "NOT_SELECTED",
        finalReviewedAt: decidedAt,
        selectedAt: null,

        reserveRank: null,
        reservePromotedAt: null,

        selectionResponse: null,
        selectionResponseAt: null,
        selectionResponseDeadline: null,
      },
    });
  });

  revalidatePath("/staff/selection");
}

export async function releaseSelectionDecisions(formData: FormData) {
  const admin = await requireStaffAdmin();

  const eventSlug = String(
    formData.get("eventSlug") || "",
  ).trim();

  if (!eventSlug) {
    throw new Error(
      "Showcase event is required.",
    );
  }

  await prisma.$transaction(async (tx) => {
    /*
     * Lock the Event row.
     *
     * This uses the same per-event locking strategy as the
     * selection-capacity action. While release is taking place,
     * no competing capacity-changing operation for this event
     * should be able to cross the release boundary.
     */
    const lockedEvents = await tx.$queryRaw<
      Array<{
        id: string;
        slug: string;
        capacity: number | null;
        reserveCapacity: number | null;
        selectionDecisionsReleasedAt: Date | null;
      }>
    >`
      SELECT
        "id",
        "slug",
        "capacity",
        "reserveCapacity",
        "selectionDecisionsReleasedAt"
      FROM "Event"
      WHERE "slug" = ${eventSlug}
      FOR UPDATE
    `;

    const event = lockedEvents[0];

    if (!event) {
      throw new Error(
        "Showcase event not found.",
      );
    }

    if (event.selectionDecisionsReleasedAt) {
      throw new Error(
        "Selection decisions for this event have already been released.",
      );
    }

    if (!event.capacity || event.capacity < 1) {
      throw new Error(
        "A valid showcase capacity must be configured before decisions can be released.",
      );
    }

    /*
     * The main squad must be complete before release.
     *
     * Lagos 2027 currently has capacity 100, therefore release
     * cannot occur at 99 or less and cannot occur above capacity.
     */
    const selectedCount =
      await tx.showcaseApplication.count({
        where: {
          eventSlug: event.slug,
          status: "SELECTED",
        },
      });

    if (selectedCount !== event.capacity) {
      throw new Error(
        `Selection decisions cannot be released until exactly ${event.capacity} players are selected. Current selected count: ${selectedCount}.`,
      );
    }

    /*
     * Reserve capacity is a ceiling, rather than a requirement
     * that every reserve place must necessarily be filled.
     */
    const reserveCount =
      await tx.showcaseApplication.count({
        where: {
          eventSlug: event.slug,
          status: "RESERVE",
        },
      });

    if (
      reserveCount > 0 &&
      (!event.reserveCapacity ||
        event.reserveCapacity < 1)
    ) {
      throw new Error(
        "Reserve players exist but no valid reserve capacity is configured.",
      );
    }

    if (
      event.reserveCapacity !== null &&
      reserveCount > event.reserveCapacity
    ) {
      throw new Error(
        `The reserve list exceeds the configured capacity of ${event.reserveCapacity}.`,
      );
    }

    /*
     * Every application already inside the selection workflow
     * must have a final internal outcome before release.
     *
     * DRAFT applicants are deliberately excluded: registration
     * closure prevents new applications, but an unfinished draft
     * is not silently turned into a football-selection outcome.
     */
    const unresolvedCount =
      await tx.showcaseApplication.count({
        where: {
          eventSlug: event.slug,

          status: {
            in: [
              "SUBMITTED",
              "ELIGIBILITY_REVIEW",
              "VIDEO_REVIEW",
              "LONGLISTED",
              "FINAL_REVIEW",
            ],
          },
        },
      });

    if (unresolvedCount > 0) {
      throw new Error(
        `Selection decisions cannot be released while ${unresolvedCount} application${unresolvedCount === 1 ? "" : "s"} remain unresolved.`,
      );
    }

    const releasedAt = new Date();

    /*
     * Selected players now have an officially released offer.
     *
     * Their response lifecycle begins at PENDING.
     *
     * We deliberately do not invent an acceptance deadline here.
     * selectionResponseDeadline remains null until the operational
     * deadline policy is defined.
     */
    await tx.showcaseApplication.updateMany({
      where: {
        eventSlug: event.slug,
        status: "SELECTED",
      },

      data: {
        selectionDecisionReleasedAt:
          releasedAt,

        selectionResponse: "PENDING",
        selectionResponseAt: null,
        selectionResponseDeadline: null,
      },
    });

    /*
     * Reserve and not-selected outcomes are also officially
     * published at the same release milestone, but they do not
     * have a selected-player acceptance response.
     */
    await tx.showcaseApplication.updateMany({
      where: {
        eventSlug: event.slug,

        status: {
          in: [
            "RESERVE",
            "NOT_SELECTED",
          ],
        },
      },

      data: {
        selectionDecisionReleasedAt:
          releasedAt,

        selectionResponse: null,
        selectionResponseAt: null,
        selectionResponseDeadline: null,
      },
    });

    /*
     * The Event record is the authoritative release milestone.
     *
     * Registration is closed in the same transaction so the
     * public application state and official squad decision cannot
     * drift apart.
     */
    await tx.event.update({
      where: {
        id: event.id,
      },

      data: {
        selectionDecisionsReleasedAt:
          releasedAt,

        selectionDecisionsReleasedByStaffUserId:
          admin.id,

        registrationOpen: false,
      },
    });
  });

  revalidatePath("/staff/selection");
  revalidatePath("/staff/events");
  revalidatePath("/staff/dashboard");
  revalidatePath("/apply/lagos-2027");
}
