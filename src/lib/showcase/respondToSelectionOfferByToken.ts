import "server-only";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import {
  getSelectionResponseTokenHash,
  type SelectionResponseTokenPurpose,
} from "@/lib/showcase/selectionResponseTokens";

import {
  respondToSelectionOffer,
  type ShowcaseOfferResponse,
} from "@/lib/showcase/respondToSelectionOffer";

type Args = {
  rawToken: string;
  response: ShowcaseOfferResponse;
};

export async function respondToSelectionOfferByToken({
  rawToken,
  response,
}: Args) {
  const token = rawToken.trim();

  if (!token) {
    throw new Error("This selection response link is invalid or has expired.");
  }

  if (response !== "ACCEPTED" && response !== "DECLINED") {
    throw new Error("A valid offer response is required.");
  }

  const tokenHash = getSelectionResponseTokenHash(
    token,
    response as SelectionResponseTokenPurpose,
  );

  const now = new Date();

  /*
   * Atomically claim the response token before changing the offer.
   *
   * GET requests never call this function, so email-link scanners cannot
   * consume the token or alter the player's selection status.
   */
  const claimed = await prisma.showcaseSelectionResponseToken.updateMany({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: {
        gt: now,
      },
      application: {
        status: "SELECTED",
        selectionDecisionReleasedAt: {
          not: null,
        },
        selectionResponse: "PENDING",
      },
    },
    data: {
      usedAt: now,
    },
  });

  if (claimed.count !== 1) {
    throw new Error(
      "This selection response link is invalid, has expired, or has already been used.",
    );
  }

  const responseToken = await prisma.showcaseSelectionResponseToken.findUnique({
    where: {
      tokenHash,
    },
    select: {
      applicationId: true,
    },
  });

  if (!responseToken) {
    throw new Error("Selection response token could not be found.");
  }

  try {
    const result = await respondToSelectionOffer({
      applicationId: responseToken.applicationId,
      response,
    });

    /*
     * Once the player has made a final decision, invalidate every other
     * outstanding response link for the same offer.
     */
    await prisma.showcaseSelectionResponseToken.updateMany({
      where: {
        applicationId: responseToken.applicationId,
        usedAt: null,
      },
      data: {
        usedAt: result.respondedAt,
      },
    });

    revalidatePath(
      `/apply/${result.eventSlug}/${result.applicationId}/confirmation`,
    );
    revalidatePath("/account");
    revalidatePath("/staff/selection");

    return result;
  } catch (error) {
    /*
     * The token was claimed but the lifecycle change failed.
     *
     * Release only this claim so a legitimate player can retry. The
     * conditional usedAt match prevents us from reviving a token whose
     * state has subsequently changed.
     */
    await prisma.showcaseSelectionResponseToken.updateMany({
      where: {
        tokenHash,
        usedAt: now,
      },
      data: {
        usedAt: null,
      },
    });

    throw error;
  }
}
