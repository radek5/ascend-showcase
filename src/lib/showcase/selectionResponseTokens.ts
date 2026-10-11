import "server-only";

import { createSecureToken, hashSecureToken } from "@/lib/applicants/tokens";
import { prisma } from "@/lib/prisma";

export type SelectionResponseTokenPurpose = "ACCEPTED" | "DECLINED";

const SELECTION_RESPONSE_TOKEN_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

function hashSelectionResponseToken(
  rawToken: string,
  purpose: SelectionResponseTokenPurpose,
) {
  return hashSecureToken(`${purpose}:${rawToken}`);
}

export async function createSelectionResponseTokens(applicationId: string) {
  const acceptToken = createSecureToken();
  const declineToken = createSecureToken();

  const acceptTokenHash = hashSelectionResponseToken(acceptToken, "ACCEPTED");
  const declineTokenHash = hashSelectionResponseToken(declineToken, "DECLINED");

  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + SELECTION_RESPONSE_TOKEN_LIFETIME_MS,
  );

  const application = await prisma.showcaseApplication.findUnique({
    where: {
      id: applicationId,
    },
    select: {
      id: true,
      status: true,
      selectionDecisionReleasedAt: true,
      selectionResponse: true,
    },
  });

  if (!application) {
    throw new Error("Showcase application not found.");
  }

  if (
    application.status !== "SELECTED" ||
    !application.selectionDecisionReleasedAt ||
    application.selectionResponse !== "PENDING"
  ) {
    throw new Error(
      "Selection response tokens can only be issued for a pending selected-place offer.",
    );
  }

  const createdTokens = await prisma.$transaction(async (tx) => {
    const accept = await tx.showcaseSelectionResponseToken.create({
      data: {
        applicationId: application.id,
        tokenHash: acceptTokenHash,
        expiresAt,
      },
      select: {
        id: true,
      },
    });

    const decline = await tx.showcaseSelectionResponseToken.create({
      data: {
        applicationId: application.id,
        tokenHash: declineTokenHash,
        expiresAt,
      },
      select: {
        id: true,
      },
    });

    return {
      acceptTokenId: accept.id,
      declineTokenId: decline.id,
    };
  });

  return {
    ...createdTokens,
    acceptToken,
    declineToken,
    expiresAt,
  };
}

export async function discardSelectionResponseTokens(tokenIds: string[]) {
  if (tokenIds.length === 0) {
    return;
  }

  await prisma.showcaseSelectionResponseToken.deleteMany({
    where: {
      id: {
        in: tokenIds,
      },
      usedAt: null,
    },
  });
}

export async function getValidSelectionResponseToken(
  rawToken: string,
  purpose: SelectionResponseTokenPurpose,
) {
  const token = rawToken.trim();

  if (!token) {
    return null;
  }

  const tokenHash = hashSelectionResponseToken(token, purpose);
  const now = new Date();

  const responseToken = await prisma.showcaseSelectionResponseToken.findUnique({
    where: {
      tokenHash,
    },
    select: {
      id: true,
      applicationId: true,
      expiresAt: true,
      usedAt: true,
      application: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          registrationNumber: true,
          status: true,
          selectionDecisionReleasedAt: true,
          selectionResponse: true,
        },
      },
    },
  });

  if (
    !responseToken ||
    responseToken.usedAt ||
    responseToken.expiresAt <= now ||
    responseToken.application.status !== "SELECTED" ||
    !responseToken.application.selectionDecisionReleasedAt ||
    responseToken.application.selectionResponse !== "PENDING"
  ) {
    return null;
  }

  return responseToken;
}

export function getSelectionResponseTokenHash(
  rawToken: string,
  purpose: SelectionResponseTokenPurpose,
) {
  return hashSelectionResponseToken(rawToken.trim(), purpose);
}
