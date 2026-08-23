"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

export async function updateCommercialRelationship(
  formData: FormData,
) {
  await requireStaffUser();

  const relationshipId = String(
    formData.get("relationshipId") || "",
  ).trim();

  const organisationId = String(
    formData.get("organisationId") || "",
  ).trim();

  const name = String(
    formData.get("name") || "",
  ).trim();

  if (
    !relationshipId ||
    !organisationId ||
    !name
  ) {
    throw new Error(
      "Commercial relationship details are incomplete.",
    );
  }

  const type = String(
    formData.get("type") || "SPONSOR",
  ).trim();

  const status = String(
    formData.get("status") || "PROSPECT",
  ).trim();

  const proposedValueInput = String(
    formData.get("proposedValue") || "",
  ).trim();

  const agreedValueInput = String(
    formData.get("agreedValue") || "",
  ).trim();

  const proposedValue = proposedValueInput
    ? BigInt(
        Math.round(
          Number(proposedValueInput) * 100,
        ),
      )
    : null;

  const agreedValue = agreedValueInput
    ? BigInt(
        Math.round(
          Number(agreedValueInput) * 100,
        ),
      )
    : null;

  if (
    proposedValue !== null &&
    (!Number.isFinite(proposedValue) ||
      proposedValue < 0n)
  ) {
    throw new Error(
      "Proposed value is invalid.",
    );
  }

  if (
    agreedValue !== null &&
    (!Number.isFinite(agreedValue) ||
      agreedValue < 0n)
  ) {
    throw new Error(
      "Agreed value is invalid.",
    );
  }

  const nextActionDateInput = String(
    formData.get("nextActionDate") || "",
  ).trim();

  await prisma.$transaction([
    prisma.commercialOrganisation.update({
      where: {
        id: organisationId,
      },

      data: {
        name,

        type: type as
          | "SPONSOR"
          | "PARTNER"
          | "SUPPLIER",

        sector:
          String(
            formData.get("sector") || "",
          ).trim() || null,

        website:
          String(
            formData.get("website") || "",
          ).trim() || null,

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
    }),

    prisma.commercialRelationship.update({
      where: {
        id: relationshipId,
      },

      data: {
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
        agreedValue,

        currency:
          String(
            formData.get("currency") || "",
          ).trim() || null,

        nextAction:
          String(
            formData.get("nextAction") || "",
          ).trim() || null,

        nextActionDate:
          nextActionDateInput
            ? new Date(
                `${nextActionDateInput}T12:00:00`,
              )
            : null,

        notes:
          String(
            formData.get("notes") || "",
          ).trim() || null,
      },
    }),
  ]);

  revalidatePath("/staff/commercial");
  revalidatePath(
    `/staff/commercial/${relationshipId}`,
  );
  revalidatePath(
    `/staff/commercial/${relationshipId}/edit`,
  );

  redirect("/staff/commercial");
}
