"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

export async function createFinanceExpense(
  formData: FormData,
) {
  const staffUser = await requireStaffUser();

  const eventId = String(
    formData.get("eventId") || "",
  ).trim();

  const description = String(
    formData.get("description") || "",
  ).trim();

  if (!eventId || !description) {
    throw new Error(
      "Event and expense description are required.",
    );
  }

  const status = String(
    formData.get("status") || "PLANNED",
  ).trim();

  const currency = String(
    formData.get("currency") || "NGN",
  ).trim();

  const budgetAmount =
    parseMoney(formData.get("budgetAmount"));

  const forecastAmount =
    parseMoney(formData.get("forecastAmount"));

  const committedAmount =
    parseMoney(formData.get("committedAmount"));

  const paidAmount =
    parseMoney(formData.get("paidAmount")) ?? 0;

  if (
    budgetAmount !== null &&
    budgetAmount < 0
  ) {
    throw new Error(
      "Budget amount cannot be negative.",
    );
  }

  if (
    forecastAmount !== null &&
    forecastAmount < 0
  ) {
    throw new Error(
      "Forecast amount cannot be negative.",
    );
  }

  if (
    committedAmount !== null &&
    committedAmount < 0
  ) {
    throw new Error(
      "Committed amount cannot be negative.",
    );
  }

  if (paidAmount < 0) {
    throw new Error(
      "Paid amount cannot be negative.",
    );
  }

  if (
    committedAmount !== null &&
    paidAmount > committedAmount
  ) {
    throw new Error(
      "Paid amount cannot be greater than committed amount.",
    );
  }

  const dueDateInput = String(
    formData.get("dueDate") || "",
  ).trim();

  const paidAtInput = String(
    formData.get("paidAt") || "",
  ).trim();

  await prisma.financeExpense.create({
    data: {
      eventId,

      categoryId:
        String(
          formData.get("categoryId") || "",
        ).trim() || null,

      supplierName:
        String(
          formData.get("supplierName") || "",
        ).trim() || null,

      description,

      currency,

      budgetAmount,
      forecastAmount,
      committedAmount,
      paidAmount,

      status: status as
        | "PLANNED"
        | "QUOTED"
        | "APPROVED"
        | "COMMITTED"
        | "PART_PAID"
        | "PAID"
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
        ? new Date(`${dueDateInput}T12:00:00`)
        : null,

      paidAt: paidAtInput
        ? new Date(`${paidAtInput}T12:00:00`)
        : null,

      notes:
        String(
          formData.get("notes") || "",
        ).trim() || null,

      createdByStaffUserId:
        staffUser.id,
    },
  });

  revalidatePath("/staff/finance");
  revalidatePath("/staff/dashboard");

  redirect("/staff/finance");
}

function parseMoney(
  value: FormDataEntryValue | null,
) {
  const raw = String(
    value || "",
  ).trim();

  if (!raw) {
    return null;
  }

  const amount = Number(raw);

  if (!Number.isFinite(amount)) {
    throw new Error(
      "One of the financial amounts is invalid.",
    );
  }

  return BigInt(Math.round(amount * 100));
}
