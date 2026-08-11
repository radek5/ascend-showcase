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

  const registration = await prisma.registration.findUnique({
    where: {
      id: registrationId,
    },
  });

  if (!registration) {
    throw new Error("Registration not found.");
  }

  if (hasAgent === "no") {
    await prisma.registration.update({
      where: {
        id: registrationId,
      },
      data: {
        representationStatus: "UNREPRESENTED_OPEN",
        currentStep: "VIDEO",
      },
    });

    redirect(
      `/register/video?registration=${registrationId}`,
    );
  }

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
    throw new Error("Agent full name is required.");
  }

  await prisma.registration.update({
    where: {
      id: registrationId,
    },
    data: {
      representationStatus: "REPRESENTED",
      currentStep: "VIDEO",
    },
  });

  /*
   * We will persist the detailed representative record separately
   * once its exact Prisma fields have been confirmed.
   *
   * For now the critical Registration representation status is
   * persisted correctly and Review will display it.
   */

  console.log("Representation details:", {
    registrationId,
    agentName,
    agencyName,
    agentEmail,
    agentPhone,
    agentCountry,
    fifaLicenceNumber,
    representationStartDate,
    representationEndDate,
    exclusive,
    contactAuthorised,
  });

  redirect(
    `/register/video?registration=${registrationId}`,
  );
}
