import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

type AllocateProfessionalRegistrationNumberArgs = {
  registrationId: string;
};

const MAX_ALLOCATION_ATTEMPTS = 5;

export async function allocateProfessionalRegistrationNumber({
  registrationId,
}: AllocateProfessionalRegistrationNumberArgs) {
  const registration =
    await prisma.professionalRegistration.findUnique({
      where: {
        id: registrationId,
      },

      select: {
        id: true,
        eventId: true,
        registrationNumber: true,
      },
    });

  if (!registration) {
    throw new Error("Professional registration not found.");
  }

  /*
   * Registration identity has already been allocated.
   * Never replace or renumber it.
   */
  if (registration.registrationNumber) {
    return registration.registrationNumber;
  }

  /*
   * Lagos 2027 professional registration format:
   *
   * RX1-LAG27-PRO-001
   *
   * Registration numbers are permanent and are issued
   * when the professional registration is submitted.
   *
   * They do not represent approval, accreditation or
   * confirmation of attendance.
   */
  for (let attempt = 0; attempt < MAX_ALLOCATION_ATTEMPTS; attempt += 1) {
    const existing =
      await prisma.professionalRegistration.findMany({
        where: {
          eventId: registration.eventId,

          registrationNumber: {
            not: null,
          },
        },

        select: {
          registrationNumber: true,
        },
      });

    let highestSequence = 0;

    for (const item of existing) {
      if (!item.registrationNumber) {
        continue;
      }

      const match =
        item.registrationNumber.match(
          /^RX1-LAG27-PRO-(\d+)$/,
        );

      if (!match) {
        continue;
      }

      const sequence = Number(match[1]);

      if (
        Number.isFinite(sequence) &&
        sequence > highestSequence
      ) {
        highestSequence = sequence;
      }
    }

    const nextSequence = highestSequence + 1;

    const suffix = String(nextSequence).padStart(3, "0");

    const registrationNumber =
      `RX1-LAG27-PRO-${suffix}`;

    try {
      const updated =
        await prisma.professionalRegistration.update({
          where: {
            id: registration.id,
          },

          data: {
            registrationNumber,
          },

          select: {
            registrationNumber: true,
          },
        });

      return updated.registrationNumber!;
    } catch (error) {
      /*
       * A simultaneous submission may have allocated
       * the same sequence first. The unique constraint
       * is the final authority, so retry with the newly
       * observed highest sequence.
       */
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const current =
          await prisma.professionalRegistration.findUnique({
            where: {
              id: registration.id,
            },

            select: {
              registrationNumber: true,
            },
          });

        if (current?.registrationNumber) {
          return current.registrationNumber;
        }

        continue;
      }

      throw error;
    }
  }

  throw new Error(
    "Unable to allocate professional registration number.",
  );
}
