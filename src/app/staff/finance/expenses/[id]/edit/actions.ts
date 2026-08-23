"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";

export async function updateFinanceExpense(
  formData: FormData,
) {
  await requireStaffUser();

  const expenseId = String(
    formData.get("expenseId") || "",
  ).trim();

  const description = String(
    formData.get("description") || "",
  ).trim();

  if (!expenseId || !description) {
    throw new Error(
      "Expense ID and description are required.",
    );
  }

  const budgetAmount =
    parseMoney(formData.get("budgetAmount"));

  const forecastAmount =
    parseMoney(formData.get("forecastAmount"));

  const committedAmount =
    parseMoney(formData.get("committedAmount"));

  const paidAmount =
    parseMoney(formData.get("paidAmount")) ?? 0n;

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

  const selectedStatus = String(
  formData.get("status") || "PLANNED",
).trim();

let status = selectedStatus;

if (
  committedAmount !== null &&
  committedAmount > 0n
) {
  if (paidAmount >= committedAmount) {
    status = "PAID";
  } else if (paidAmount > 0n) {
    status = "PART_PAID";
  }
}

  await prisma.financeExpense.update({
    where: {
      id: expenseId,
    },

    data: {
      categoryId:
        String(
          formData.get("categoryId") || "",
        ).trim() || null,

      supplierName:
        String(
          formData.get("supplierName") || "",
        ).trim() || null,

      description,

      currency:
        String(
          formData.get("currency") || "NGN",
        ).trim(),

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
    },
  });

  revalidatePath("/staff/finance");
  revalidatePath(
    `/staff/finance/expenses/${expenseId}/edit`,
  );
  revalidatePath("/staff/dashboard");

  redirect("/staff/finance");
}

export async function cancelFinanceExpense(
  formData: FormData,
) {
  await requireStaffUser();

  const expenseId = String(
    formData.get("expenseId") || "",
  ).trim();

  if (!expenseId) {
    throw new Error(
      "Expense record ID is required.",
    );
  }

  await prisma.financeExpense.update({
    where: {
      id: expenseId,
    },

    data: {
      status: "CANCELLED",
    },
  });

  revalidatePath("/staff/finance");
  revalidatePath("/staff/finance/expenses");
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
      "One of the financial amounts is invalid.",
    );
  }

  return BigInt(Math.round(amount * 100));
}
