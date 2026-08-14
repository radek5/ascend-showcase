"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function updateRepresentation(formData: FormData) {
  const registrationId = String(
    formData.get("registrationId") || "",
  ).trim();

  const hasAgent = String(
    formData.get("hasAgent") || "",
  ).trim();

  const ascendRepresentationInterest = String(
    formData.get("ascendRepresentationInterest") || "",
  ).trim();

  const declarationConfirmed =
    formData.get("declarationConfirmed") === "on";

  if (!registrationId) {
    throw new Error("Registration ID missing.");
  }

  if (hasAgent !== "yes" && hasAgent !== "no") {
    throw new Error(
      "Please confirm whether the player is currently represented.",
    );
  }

  if (!declarationConfirmed) {
    throw new Error(
      "Please confirm that the representation information is accurate.",
    );
  }

  const registration =
    await prisma.registration.findUnique({
      where: {
        id: registrationId,
      },
    });

  if (!registration) {
    throw new Error("Registration not found.");
  }

  // ============================================================
  // UNREPRESENTED PLAYER
  // ============================================================

  if (hasAgent === "no") {
    if (
      ascendRepresentationInterest !== "yes" &&
      ascendRepresentationInterest !== "no"
    ) {
      throw new Error(
        "Please confirm whether you would like to be represented by ASCEND.",
      );
    }

    const interestedInAscendRepresentation =
      ascendRepresentationInterest === "yes";

    await prisma.$transaction([
      prisma.registration.update({
        where: {
          id: registrationId,
        },
        data: {
          representationStatus:
            "UNREPRESENTED_OPEN",
          currentStep: "VIDEO",
        },
      }),

      prisma.representationDeclaration.upsert({
        where: {
          registrationId,
        },

        update: {
          status: "UNREPRESENTED_OPEN",

          interestedInAscendRepresentation,

          agentName: null,
          agencyName: null,
          agentEmail: null,
          agentPhone: null,
          agentCountry: null,
          fifaLicenceNumber: null,

          representationStart: null,
          representationEnd: null,
          exclusiveRepresentation: null,

          agentContactConsent: false,

          declarationConfirmed: true,
          declaredAt: new Date(),
        },

        create: {
          registrationId,

          status: "UNREPRESENTED_OPEN",

          interestedInAscendRepresentation,

          agentContactConsent: false,

          declarationConfirmed: true,
          declaredAt: new Date(),
        },
      }),
    ]);

    redirect(
      `/register/video?registration=${registrationId}`,
    );
  }

  // ============================================================
  // REPRESENTED PLAYER
  // ============================================================

  const agentName = String(
    formData.get("agentName") || "",
  ).trim();

  const agencyName = String(
    formData.get("agencyName") || "",
  ).trim();

  const agentEmail = String(
    formData.get("agentEmail") || "",
  ).trim();

  const agentPhone = String(
    formData.get("agentPhone") || "",
  ).trim();

  const agentCountry = String(
    formData.get("agentCountry") || "",
  ).trim();

  const fifaLicenceNumber = String(
    formData.get("fifaLicenceNumber") || "",
  ).trim();

  const representationStartDate = String(
    formData.get("representationStartDate") || "",
  ).trim();

  const representationEndDate = String(
    formData.get("representationEndDate") || "",
  ).trim();

  const exclusive = String(
    formData.get("exclusive") || "",
  ).trim();

  const contactAuthorised =
    formData.get("contactAuthorised") === "on";

  if (!agentName) {
    throw new Error(
      "Agent full name is required.",
    );
  }

  const exclusiveRepresentation =
    exclusive === "yes"
      ? "YES"
      : exclusive === "no"
        ? "NO"
        : exclusive === "unknown"
          ? "UNKNOWN"
          : null;

  const representationStart =
    representationStartDate
      ? new Date(
          `${representationStartDate}T00:00:00.000Z`,
        )
      : null;

  const representationEnd =
    representationEndDate
      ? new Date(
          `${representationEndDate}T00:00:00.000Z`,
        )
      : null;

  await prisma.$transaction([
    prisma.registration.update({
      where: {
        id: registrationId,
      },
      data: {
        representationStatus: "REPRESENTED",
        currentStep: "VIDEO",
      },
    }),

    prisma.representationDeclaration.upsert({
      where: {
        registrationId,
      },

      update: {
        status: "REPRESENTED",

        interestedInAscendRepresentation: null,

        agentName,
        agencyName: agencyName || null,
        agentEmail: agentEmail || null,
        agentPhone: agentPhone || null,
        agentCountry: agentCountry || null,

        fifaLicenceNumber:
          fifaLicenceNumber || null,

        representationStart,
        representationEnd,

        exclusiveRepresentation,

        agentContactConsent:
          contactAuthorised,

        declarationConfirmed: true,
        declaredAt: new Date(),
      },

      create: {
        registrationId,

        status: "REPRESENTED",

        interestedInAscendRepresentation: null,

        agentName,
        agencyName: agencyName || null,
        agentEmail: agentEmail || null,
        agentPhone: agentPhone || null,
        agentCountry: agentCountry || null,

        fifaLicenceNumber:
          fifaLicenceNumber || null,

        representationStart,
        representationEnd,

        exclusiveRepresentation,

        agentContactConsent:
          contactAuthorised,

        declarationConfirmed: true,
        declaredAt: new Date(),
      },
    }),
  ]);

  redirect(
    `/register/video?registration=${registrationId}`,
  );
}
