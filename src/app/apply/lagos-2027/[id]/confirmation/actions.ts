"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  checkApplicantApplicationAccess,
  getApplicantApplicationAccessError,
} from "@/lib/applicants/applicationOwnership";
import { prisma } from "@/lib/prisma";

type OfferResponse = "ACCEPTED" | "DECLINED";

export async function respondToShowcaseOffer(formData: FormData) {
  const applicationId = String(formData.get("applicationId") || "").trim();
  const response = String(formData.get("response") || "").trim();

  if (!applicationId) {
    throw new Error("Application ID is required.");
  }

  if (response !== "ACCEPTED" && response !== "DECLINED") {
    throw new Error("A valid offer response is required.");
  }

  const access = await checkApplicantApplicationAccess(applicationId);

  if (!access.authorised) {
    const accessError = getApplicantApplicationAccessError(access);

    if (accessError.status === 401) {
      redirect("/apply/lagos-2027/account/login");
    }

    throw new Error(accessError.error);
  }

  const application = await prisma.showcaseApplication.findUnique({
    where: {
      id: access.applicationId,
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

  /*
   * Atomically consume the pending offer.
   *
   * The PENDING condition prevents two browser tabs or repeated
   * requests from recording conflicting ACCEPTED / DECLINED
   * responses.
   */
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
      selectionResponse: response as OfferResponse,
      selectionResponseAt: respondedAt,
    },
  });

  if (updated.count !== 1) {
    throw new Error(
      "Your offer response could not be recorded because the offer has already changed. Please refresh the page.",
    );
  }

  revalidatePath(
    `/apply/${application.eventSlug}/${application.id}/confirmation`,
  );
  revalidatePath("/account");

  return {
    success: true,
    response: response as OfferResponse,
  };
}
