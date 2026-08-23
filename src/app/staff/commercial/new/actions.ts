"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

export async function createCommercialRelationship(
  formData: FormData,
) {
  await requireStaffUser();

  const eventId = String(
    formData.get("eventId") || "",
  ).trim();

  const name = String(
    formData.get("name") || "",
  ).trim();

  const type = String(
    formData.get("type") || "SPONSOR",
  ).trim();

  const status = String(
    formData.get("status") || "PROSPECT",
  ).trim();

  if (!eventId || !name) {
    throw new Error(
      "Event and organisation name are required.",
    );
  }

  const proposedValueInput = String(
    formData.get("proposedValue") || "",
  ).trim();

  // Values entered by staff are normal currency amounts.
  // Store them in minor units, consistent with ASCEND payments.
  const proposedValue = proposedValueInput
    ? BigInt(
        Math.round(
          Number(proposedValueInput) * 100,
        ),
      )
    : null;

  if (
    proposedValue !== null &&
    (!Number.isFinite(proposedValue) ||
      proposedValue < 0n)
  ) {
    throw new Error(
      "Proposed value must be a valid positive amount.",
    );
  }

  const nextActionDateInput = String(
    formData.get("nextActionDate") || "",
  ).trim();

  const organisation =
    await prisma.commercialOrganisation.create({
      data: {
        name,

        type: type as
          | "SPONSOR"
          | "PARTNER"
          | "SUPPLIER",

        sector:
          String(formData.get("sector") || "").trim() ||
          null,

        website:
          String(formData.get("website") || "").trim() ||
          null,

        contactName:
          String(
            formData.get("contactName") || "",
          ).trim() || null,

        contactEmail:
          String(
            formData.get("contactEmail") || "",
          ).trim() || null,

        contactPhone:
          String(
            formData.get("contactPhone") || "",
          ).trim() || null,
      },
    });

  await prisma.commercialRelationship.create({
    data: {
      organisationId: organisation.id,
      eventId,

      status: status as
        | "PROSPECT"
        | "CONTACTED"
        | "DISCUSSION"
        | "PROPOSAL_SENT"
        | "NEGOTIATION"
        | "CONFIRMED"
        | "ACTIVATED"
        | "COMPLETED"
        | "DECLINED",

      packageName:
        String(
          formData.get("packageName") || "",
        ).trim() || null,

      contributionType:
  (String(
    formData.get("contributionType") || "",
  ).trim() as
    | "CASH"
    | "IN_KIND"
    | "CASH_AND_IN_KIND"
    | "") || null,

inKindDescription:
  String(
    formData.get("inKindDescription") || "",
  ).trim() || null,

      proposedValue,

      currency:
        String(
          formData.get("currency") || "",
        ).trim() || null,

      nextAction:
        String(
          formData.get("nextAction") || "",
        ).trim() || null,

      nextActionDate: nextActionDateInput
        ? new Date(`${nextActionDateInput}T12:00:00`)
        : null,

      notes:
        String(formData.get("notes") || "").trim() ||
        null,
    },
  });

  revalidatePath("/staff/commercial");

  redirect("/staff/commercial");
}
