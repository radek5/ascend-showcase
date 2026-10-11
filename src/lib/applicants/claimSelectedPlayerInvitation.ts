import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { hashSecureToken } from "@/lib/applicants/tokens";

function normalisePlayerName(value: string) {
  return value
    .normalize("NFKC")
    .trim()
    .replace(/\\s+/g, " ")
    .toLocaleUpperCase("en");
}

type TransactionClient = Prisma.TransactionClient;

type ClaimSelectedPlayerInvitationArgs = {
  tx: TransactionClient;
  token: string;
  applicationId: string;
  applicantUserId: string;
  eventSlug: string;
};

function samePlayerName(a: string, b: string): boolean {
  const words = (name: string) =>
    normalisePlayerName(name).split(" ").filter(Boolean).sort();

  const first = words(a);
  const second = words(b);

  return (
    first.length > 0 &&
    first.length === second.length &&
    first.every((word, index) => word === second[index])
  );
}

export async function claimSelectedPlayerInvitation({
  tx,
  token,
  applicationId,
  applicantUserId,
  eventSlug,
}: ClaimSelectedPlayerInvitationArgs) {
  if (token.length < 32 || token.length > 256) {
    throw new Error("INVALID_SELECTED_PLAYER_INVITATION");
  }

  const application = await tx.showcaseApplication.findFirst({
    where: {
      id: applicationId,
      eventSlug,
      userId: applicantUserId,
      submittedAt: null,
      status: "DRAFT",
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      selectedPlayerRecord: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!application) {
    throw new Error("APPLICATION_NOT_CLAIMABLE");
  }

  const tokenHash = hashSecureToken(token);
  const now = new Date();

  if (application.selectedPlayerRecord) {
    const existingClaim = await tx.showcaseSelectedPlayer.findFirst({
      where: {
        id: application.selectedPlayerRecord.id,
        registrationTokenHash: tokenHash,
        matchedApplicationId: applicationId,
        footballSelected: true,
        registrationTokenUsedAt: { not: null },
      },
      select: { id: true },
    });

    if (existingClaim) {
      return true;
    }

    throw new Error("APPLICATION_ALREADY_LINKED_TO_ANOTHER_INVITATION");
  }

  const invitation = await tx.showcaseSelectedPlayer.findFirst({
    where: {
      registrationTokenHash: tokenHash,
      eventSlug,
      footballSelected: true,
      registrationTokenExpiresAt: { gt: now },
      registrationTokenUsedAt: null,
      matchedApplicationId: null,
    },
    select: {
      fullName: true,
    },
  });

  if (!invitation) {
    throw new Error("SELECTED_PLAYER_INVITATION_UNAVAILABLE");
  }

  const applicationName = normalisePlayerName(
    `${application.firstName} ${application.lastName}`,
  );

  if (!samePlayerName(applicationName, invitation.fullName)) {
    throw new Error("SELECTED_PLAYER_IDENTITY_MISMATCH");
  }

  const claimed = await tx.showcaseSelectedPlayer.updateMany({
    where: {
      registrationTokenHash: tokenHash,
      eventSlug,
      footballSelected: true,
      registrationTokenExpiresAt: {
        gt: now,
      },
      registrationTokenUsedAt: null,
      matchedApplicationId: null,
    },
    data: {
      registrationTokenUsedAt: now,
      matchedApplicationId: applicationId,
      matchedAt: now,
    },
  });

  if (claimed.count !== 1) {
    throw new Error("SELECTED_PLAYER_INVITATION_UNAVAILABLE");
  }

  return true;
}
