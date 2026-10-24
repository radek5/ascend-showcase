import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { hashSecureToken } from "@/lib/applicants/tokens";

function normalisePlayerName(value: string) {
  return value
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleUpperCase("en");
}

type TransactionClient = Prisma.TransactionClient;

type ClaimSelectedPlayerInvitationArgs = {
  tx: TransactionClient;
  token?: string | null;
  applicationId: string;
  applicantUserId: string;
  eventSlug: string;
};

function samePlayerName(a: string, b: string): boolean {
  const words = (name: string) =>
    normalisePlayerName(name).split(" ").filter(Boolean).sort();

  const first = words(a);
  const second = words(b);

  if (first.length === 0 || second.length === 0) {
    return false;
  }

  // The selected-player record may contain only one known name.
  // Accept it when it appears as a complete name component
  // in the applicant's full registration name.
  if (second.length === 1) {
    return first.includes(second[0]);
  }

  // Preserve existing order-independent matching for full names.
  return (
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
}: ClaimSelectedPlayerInvitationArgs): Promise<boolean> {
  if (token && (token.length < 32 || token.length > 256)) {
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
        select: { id: true },
      },
    },
  });

  if (!application) {
    throw new Error("APPLICATION_NOT_CLAIMABLE");
  }

  const tokenHash = token ? hashSecureToken(token) : null;
  const now = new Date();

  const claimedInvitations = await tx.showcaseSelectedPlayer.findMany({
    where: {
      eventSlug,
      footballSelected: true,
      registeredApplicantUserId: applicantUserId,
      registrationTokenUsedAt: { not: null },
      ...(tokenHash ? { registrationTokenHash: tokenHash } : {}),
    },
    select: {
      id: true,
      fullName: true,
      matchedApplicationId: true,
    },
    take: 2,
  });

  if (claimedInvitations.length === 0) {
    if (tokenHash) {
      throw new Error("SELECTED_PLAYER_INVITATION_UNAVAILABLE");
    }
    return false;
  }

  if (claimedInvitations.length !== 1) {
    throw new Error("MULTIPLE_SELECTED_PLAYER_INVITATIONS");
  }

  const invitation = claimedInvitations[0];

  if (
    application.selectedPlayerRecord &&
    application.selectedPlayerRecord.id !== invitation.id
  ) {
    throw new Error("APPLICATION_ALREADY_LINKED_TO_ANOTHER_INVITATION");
  }

  if (
    invitation.matchedApplicationId &&
    invitation.matchedApplicationId !== applicationId
  ) {
    throw new Error("SELECTED_PLAYER_INVITATION_ALREADY_LINKED");
  }

  const applicationName = normalisePlayerName(
    `${application.firstName} ${application.lastName}`,
  );

  if (!samePlayerName(applicationName, invitation.fullName)) {
    throw new Error("SELECTED_PLAYER_IDENTITY_MISMATCH");
  }

  if (invitation.matchedApplicationId === applicationId) {
    return true;
  }

  const claimed = await tx.showcaseSelectedPlayer.updateMany({
    where: {
      id: invitation.id,
      eventSlug,
      footballSelected: true,
      registeredApplicantUserId: applicantUserId,
      registrationTokenUsedAt: { not: null },
      matchedApplicationId: null,
      ...(tokenHash ? { registrationTokenHash: tokenHash } : {}),
    },
    data: {
      matchedApplicationId: applicationId,
      matchedAt: now,
    },
  });

  if (claimed.count !== 1) {
    throw new Error("SELECTED_PLAYER_INVITATION_UNAVAILABLE");
  }

  return true;
}
