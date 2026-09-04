import crypto from "node:crypto";

import { prisma } from "@/lib/prisma";

type AllocateApplicationIdentityArgs = {
  applicationId: string;
};

export async function allocateApplicationIdentity({
  applicationId,
}: AllocateApplicationIdentityArgs) {
  const application = await prisma.showcaseApplication.findUnique({
    where: {
      id: applicationId,
    },

    select: {
      id: true,
      eventSlug: true,

      registrationNumber: true,
      assessmentCode: true,
      checkInToken: true,
    },
  });

  if (!application) {
    throw new Error("Showcase application not found.");
  }

  /*
   * Identity has already been allocated.
   * Never replace or renumber it.
   */
  if (
    application.registrationNumber &&
    application.assessmentCode &&
    application.checkInToken
  ) {
    return {
      registrationNumber: application.registrationNumber,

      assessmentCode: application.assessmentCode,

      checkInToken: application.checkInToken,
    };
  }

  /*
   * Lagos 2027 identity format:
   *
   * RX1-LAG27-P-0042
   * LAG27-0042
   *
   * Both MUST always share the same suffix.
   */

  const existing = await prisma.showcaseApplication.findMany({
    where: {
      eventSlug: application.eventSlug,

      OR: [
        {
          registrationNumber: {
            not: null,
          },
        },
        {
          assessmentCode: {
            not: null,
          },
        },
      ],
    },

    select: {
      registrationNumber: true,
      assessmentCode: true,
    },
  });

  let highestSequence = 0;

  for (const item of existing) {
    const values = [item.registrationNumber, item.assessmentCode];

    for (const value of values) {
      if (!value) {
        continue;
      }

      const match = value.match(/-(\d+)$/);

      if (!match) {
        continue;
      }

      const sequence = Number(match[1]);

      if (Number.isFinite(sequence) && sequence > highestSequence) {
        highestSequence = sequence;
      }
    }
  }

  const nextSequence = highestSequence + 1;

  const suffix = String(nextSequence).padStart(4, "0");

  const registrationNumber = `RX1-LAG27-P-${suffix}`;

  const assessmentCode = `LAG27-${suffix}`;

  const checkInToken =
    application.checkInToken ?? crypto.randomBytes(32).toString("hex");

  /*
   * Unique constraints on both codes protect us
   * against accidental duplication.
   */

  const updated = await prisma.showcaseApplication.update({
    where: {
      id: application.id,
    },

    data: {
      registrationNumber,
      assessmentCode,
      checkInToken,
    },

    select: {
      registrationNumber: true,
      assessmentCode: true,
      checkInToken: true,
    },
  });

  return {
    registrationNumber: updated.registrationNumber!,

    assessmentCode: updated.assessmentCode!,

    checkInToken: updated.checkInToken!,
  };
}
