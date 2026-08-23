"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

export async function updateFinanceIncome(
  formData: FormData,
) {
  await requireStaffUser();

  const incomeId = String(
    formData.get("incomeId") || "",
  ).trim();

  const sourceName = String(
    formData.get("sourceName") || "",
  ).trim();

  if (!incomeId || !sourceName) {
    throw new Error(
      "Income ID and source name are required.",
    );
  }

  const expectedAmount =
    parseMoney(formData.get("expectedAmount"));

  const agreedAmount =
    parseMoney(formData.get("agreedAmount"));

  const invoicedAmount =
    parseMoney(formData.get("invoicedAmount"));

  const receivedAmount =
    parseMoney(formData.get("receivedAmount")) ??
    0n;

  if (
    agreedAmount !== null &&
    receivedAmount > agreedAmount
  ) {
    throw new Error(
      "Received amount cannot be greater than agreed amount.",
    );
  }

  const selectedStatus = String(
  formData.get("status") || "EXPECTED",
).trim();

let status = selectedStatus;

if (
  agreedAmount !== null &&
  agreedAmount > 0n
) {
  if (receivedAmount >= agreedAmount) {
    status = "RECEIVED";
  } else if (receivedAmount > 0n) {
    status = "PART_RECEIVED";
  }
}

  const dueDateInput = String(
    formData.get("dueDate") || "",
  ).trim();

  const receivedAtInput = String(
    formData.get("receivedAt") || "",
  ).trim();

  await prisma.financeIncome.update({
    where: {
      id: incomeId,
    },

    data: {
      categoryId:
        String(
          formData.get("categoryId") || "",
        ).trim() || null,

      commercialRelationshipId:
        String(
          formData.get(
            "commercialRelationshipId",
          ) || "",
        ).trim() || null,

      sourceName,

      description:
        String(
          formData.get("description") || "",
        ).trim() || null,

      currency:
        String(
          formData.get("currency") || "NGN",
        ).trim(),

      expectedAmount,
      agreedAmount,
      invoicedAmount,
      receivedAmount,

      status: status as
        | "EXPECTED"
        | "AGREED"
        | "INVOICED"
        | "PART_RECEIVED"
        | "RECEIVED"
        | "CANCELLED",

      invoiceReference:
        String(
          formData.get("invoiceReference") || "",
        ).trim() || null,

      paymentReference:
        String(
          formData.get("paymentReference") || "",
        ).trim() || null,

      dueDate: dueDateInput
        ? new Date(
            `${dueDateInput}T12:00:00`,
          )
        : null,

      receivedAt: receivedAtInput
        ? new Date(
            `${receivedAtInput}T12:00:00`,
          )
        : null,

      notes:
        String(
          formData.get("notes") || "",
        ).trim() || null,
    },
  });

  revalidatePath("/staff/finance");
  revalidatePath("/staff/commercial");
  revalidatePath(
    `/staff/finance/income/${incomeId}/edit`,
  );

  redirect("/staff/finance");
}

export async function cancelFinanceIncome(
  formData: FormData,
) {
  await requireStaffUser();

  const incomeId = String(
    formData.get("incomeId") || "",
  ).trim();

  if (!incomeId) {
    throw new Error(
      "Income record ID is required.",
    );
  }

  await prisma.financeIncome.update({
    where: {
      id: incomeId,
    },

    data: {
      status: "CANCELLED",
    },
  });

  revalidatePath("/staff/finance");
  revalidatePath("/staff/commercial");
  revalidatePath("/staff/dashboard");

  redirect("/staff/finance");
}

function parseMoney(
  value: FormDataEntryValue | null,
) {
  const raw = String(value || "").trim();

  if (!raw) {
    return null;
  }

  const amount = Number(raw);

  if (
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    throw new Error(
      "One of the income amounts is invalid.",
    );
  }

  return BigInt(
    Math.round(amount * 100),
  );
}
