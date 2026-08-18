"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function updateProfessionalTravel(
  formData: FormData,
) {
  const registrationId = String(
    formData.get("registrationId") || "",
  ).trim();

  const arrivalTransfer =
    String(formData.get("arrivalTransfer") || "") === "YES";

  const departureTransfer =
    String(formData.get("departureTransfer") || "") === "YES";

  if (!registrationId) {
    throw new Error(
      "Professional registration ID missing.",
    );
  }

  const registration =
    await prisma.professionalRegistration.findUnique({
      where: {
        id: registrationId,
      },
      select: {
        id: true,
        status: true,
      },
    });

  if (!registration) {
    throw new Error(
      "Professional registration not found.",
    );
  }

  const arrivalDate = String(
    formData.get("arrivalDate") || "",
  );

  const arrivalTime = String(
    formData.get("arrivalTime") || "",
  ).trim();

  const arrivalAirline = String(
    formData.get("arrivalAirline") || "",
  ).trim();

  const arrivalFlight = String(
    formData.get("arrivalFlight") || "",
  ).trim();

  const departureDate = String(
    formData.get("departureDate") || "",
  );

  const departureTime = String(
    formData.get("departureTime") || "",
  ).trim();

  const departureAirline = String(
    formData.get("departureAirline") || "",
  ).trim();

  const departureFlight = String(
    formData.get("departureFlight") || "",
  ).trim();

  if (
    arrivalTransfer &&
    (
      !arrivalDate ||
      !arrivalTime ||
      !arrivalAirline ||
      !arrivalFlight
    )
  ) {
    throw new Error(
      "Please complete all arrival flight details.",
    );
  }

  if (
    departureTransfer &&
    (
      !departureDate ||
      !departureTime ||
      !departureAirline ||
      !departureFlight
    )
  ) {
    throw new Error(
      "Please complete all departure flight details.",
    );
  }

  await prisma.professionalRegistration.update({
    where: {
      id: registrationId,
    },
    data: {
      arrivalTransfer,

      arrivalDate:
        arrivalTransfer && arrivalDate
          ? new Date(`${arrivalDate}T12:00:00`)
          : null,

      arrivalTime:
        arrivalTransfer
          ? arrivalTime || null
          : null,

      arrivalAirline:
        arrivalTransfer
          ? arrivalAirline || null
          : null,

      arrivalFlight:
        arrivalTransfer
          ? arrivalFlight || null
          : null,

      departureTransfer,

      departureDate:
        departureTransfer && departureDate
          ? new Date(`${departureDate}T12:00:00`)
          : null,

      departureTime:
        departureTransfer
          ? departureTime || null
          : null,

      departureAirline:
        departureTransfer
          ? departureAirline || null
          : null,

      departureFlight:
        departureTransfer
          ? departureFlight || null
          : null,
    },
  });

  redirect(
    `/professional-registration/accommodation?registration=${registrationId}`,
  );
}
