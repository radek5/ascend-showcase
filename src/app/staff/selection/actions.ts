"use server";

import { randomInt } from "crypto";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

async function createAssessmentCode() {
  /*
   * Anonymous football-assessment identifier.
   * The selector sees this code instead of the
   * applicant's name or personal information.
   */
  for (let attempt = 0; attempt < 20; attempt++) {
    const number = randomInt(1, 100000);

    const code =
      `LAG27-${number.toString().padStart(5, "0")}`;

    const exists =
      await prisma.showcaseApplication.findUnique({
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

  throw new Error(
    "Unable to generate a unique assessment code."
  );
}

export async function prepareForSelection(
  formData: FormData
) {
  await requireStaffUser();

  const applicationId = String(
    formData.get("applicationId") || ""
  ).trim();

  if (!applicationId) {
    throw new Error(
      "Application ID missing."
    );
  }

  const application =
    await prisma.showcaseApplication.findUnique({
      where: {
        id: applicationId,
      },
      select: {
        id: true,
        assessmentCode: true,
        status: true,
        assessmentFeePaid: true,
      },
    });

  if (!application) {
    throw new Error(
      "Application not found."
    );
  }

  const assessmentCode =
    application.assessmentCode ||
    (await createAssessmentCode());

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
        application.status ===
        "ELIGIBILITY_REVIEW"
          ? new Date()
          : undefined,
    },
  });

  revalidatePath("/staff/selection");
}

export async function assignSelector(
  formData: FormData
) {
  await requireStaffUser();

  const applicationId = String(
    formData.get("applicationId") || ""
  ).trim();

  const selectorId = String(
    formData.get("selectorId") || ""
  ).trim();

  if (!applicationId || !selectorId) {
    throw new Error(
      "Application and selector are required."
    );
  }

  const [application, selector] =
    await Promise.all([
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
    throw new Error(
      "Application not found."
    );
  }

  if (!selector || !selector.active) {
    throw new Error(
      "Selector is not available."
    );
  }

  if (!application.assessmentCode) {
    throw new Error(
      "Generate the anonymous assessment code before assigning a selector."
    );
  }

  if (
    application.status !== "VIDEO_REVIEW" &&
    application.status !== "FINAL_REVIEW" &&
    application.status !== "LONGLISTED"
  ) {
    throw new Error(
      "Application is not currently available for selector review."
    );
  }

  /*
   * Determine which review round this selector
   * assignment belongs to.
   */
  const existingAssignments =
    await prisma.selectorAssignment.findMany({
      where: {
        applicationId,
      },
      select: {
        round: true,
      },
    });

  const currentRound =
    existingAssignments.length > 0
      ? Math.max(
          ...existingAssignments.map(
            (assignment) =>
              assignment.round
          )
        )
      : 1;

  const duplicate =
    await prisma.selectorAssignment.findFirst({
      where: {
        selectorId,
        applicationId,
        round: currentRound,
      },
    });

  if (duplicate) {
    throw new Error(
      "This player is already assigned to that selector for the current review round."
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

export async function sendForSecondReview(
  formData: FormData
) {
  await requireStaffUser();

  const applicationId = String(
    formData.get("applicationId") || ""
  ).trim();

  if (!applicationId) {
    throw new Error(
      "Application ID missing."
    );
  }

  const assignments =
    await prisma.selectorAssignment.findMany({
      where: {
        applicationId,
      },
      select: {
        round: true,
      },
    });

  const nextRound =
    assignments.length > 0
      ? Math.max(
          ...assignments.map(
            (assignment) =>
              assignment.round
          )
        ) + 1
      : 2;

  await prisma.showcaseApplication.update({
    where: {
      id: applicationId,
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
