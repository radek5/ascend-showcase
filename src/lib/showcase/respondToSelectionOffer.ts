import "server-only";

import { prisma } from "@/lib/prisma";

export type ShowcaseOfferResponse = "ACCEPTED" | "DECLINED";

type Args = {
  applicationId: string;
  response: ShowcaseOfferResponse;
};

export async function respondToSelectionOffer({
  applicationId,
  response,
}: Args) {
  if (response !== "ACCEPTED" && response !== "DECLINED") {
    throw new Error("A valid offer response is required.");
  }

  const application = await prisma.showcaseApplication.findUnique({
    where: {
      id: applicationId,
    },
    select: {
      id: true,
      eventSlug: true,
      status: true,
      submittedAt: true,
      selectionDecisionReleasedAt: true,
      selectionResponse: true,
    },
  });

  if (!application) {
    throw new Error("Showcase application not found.");
  }

  if (!application.submittedAt) {
    throw new Error("The application must be submitted before responding.");
  }

  const event = await prisma.event.findUnique({
    where: {
      slug: application.eventSlug,
    },
    select: {
      selectionDecisionsReleasedAt: true,
    },
  });

  if (!event) {
    throw new Error("Showcase event not found.");
  }

  if (
    !event.selectionDecisionsReleasedAt ||
    !application.selectionDecisionReleasedAt
  ) {
    throw new Error(
      "The selection decision has not yet been formally released.",
    );
  }

  if (application.status !== "SELECTED") {
    throw new Error("Only selected players can respond to a place offer.");
  }

  if (application.selectionResponse !== "PENDING") {
    throw new Error("A response to this offer has already been recorded.");
  }

  const respondedAt = new Date();

  if (response === "ACCEPTED") {
    const updated = await prisma.showcaseApplication.updateMany({
      where: {
        id: application.id,
        status: "SELECTED",
        selectionDecisionReleasedAt: {
          not: null,
        },
        selectionResponse: "PENDING",
      },
      data: {
        selectionResponse: "ACCEPTED",
        selectionResponseAt: respondedAt,
      },
    });

    if (updated.count !== 1) {
      throw new Error(
        "Your offer response could not be recorded because the offer has already changed. Please refresh the page.",
      );
    }
  } else {
    await prisma.$transaction(async (tx) => {
      const lockedEvents = await tx.$queryRaw<
        Array<{
          id: string;
          slug: string;
          selectionDecisionsReleasedAt: Date | null;
        }>
      >`
        SELECT
          "id",
          "slug",
          "selectionDecisionsReleasedAt"
        FROM "Event"
        WHERE "slug" = ${application.eventSlug}
        FOR UPDATE
      `;

      const lockedEvent = lockedEvents[0];

      if (!lockedEvent) {
        throw new Error("Showcase event not found.");
      }

      if (!lockedEvent.selectionDecisionsReleasedAt) {
        throw new Error(
          "The selection decision has not yet been formally released.",
        );
      }

      const currentApplication = await tx.showcaseApplication.findUnique({
        where: {
          id: application.id,
        },
        select: {
          id: true,
          eventSlug: true,
          status: true,
          selectionDecisionReleasedAt: true,
          selectionResponse: true,
          selectionExitAt: true,
        },
      });

      if (!currentApplication) {
        throw new Error("Showcase application not found.");
      }

      if (currentApplication.eventSlug !== lockedEvent.slug) {
        throw new Error(
          "Application does not belong to this showcase event.",
        );
      }

      if (
        currentApplication.status !== "SELECTED" ||
        !currentApplication.selectionDecisionReleasedAt ||
        currentApplication.selectionResponse !== "PENDING" ||
        currentApplication.selectionExitAt
      ) {
        throw new Error(
          "Your offer response could not be recorded because the offer has already changed. Please refresh the page.",
        );
      }

      await tx.showcaseApplication.update({
        where: {
          id: currentApplication.id,
        },
        data: {
          status: "WITHDRAWN",
          selectionResponse: "DECLINED",
          selectionResponseAt: respondedAt,

          selectionExitAt: respondedAt,
          selectionExitReason: "PLAYER_DECLINED",
          selectionExitNotes: null,
          selectionExitByStaffUserId: null,
        },
      });
    });
  }

  return {
    applicationId: application.id,
    eventSlug: application.eventSlug,
    response,
    respondedAt,
  };
}
