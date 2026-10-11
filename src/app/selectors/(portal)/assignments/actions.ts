"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireSelector } from "@/lib/selectors/auth";

const RECOMMENDATIONS = new Set(["NOT_SELECTED", "SECOND_REVIEW", "LONGLIST"]);

export async function submitSelectorAssessment(formData: FormData) {
  const selector = await requireSelector();

  const assignmentId = String(formData.get("assignmentId") || "").trim();
  const recommendation = String(formData.get("recommendation") || "").trim();

  if (!assignmentId) {
    throw new Error("Assignment ID missing.");
  }

  if (!RECOMMENDATIONS.has(recommendation)) {
    throw new Error("Select a recommendation.");
  }

  const notes = String(formData.get("notes") || "").trim();
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    const assignment = await tx.selectorAssignment.findFirst({
      where: {
        id: assignmentId,
        selectorId: selector.id,
      },
      select: {
        id: true,
        status: true,
        applicationId: true,
      },
    });

    if (!assignment) {
      throw new Error("Assignment not found.");
    }

    if (assignment.status === "CANCELLED") {
      throw new Error("This assignment is no longer available.");
    }

    if (assignment.status === "COMPLETED") {
      throw new Error("This assessment has already been submitted.");
    }

    await tx.selectorAssessment.upsert({
      where: {
        assignmentId: assignment.id,
      },
      create: {
        assignmentId: assignment.id,
        notes: notes || null,
        recommendation: recommendation as
          "NOT_SELECTED" | "SECOND_REVIEW" | "LONGLIST",
        submittedAt: now,
      },
      update: {
        notes: notes || null,
        recommendation: recommendation as
          "NOT_SELECTED" | "SECOND_REVIEW" | "LONGLIST",
        submittedAt: now,
      },
    });

    await tx.selectorAssignment.update({
      where: {
        id: assignment.id,
      },
      data: {
        status: "COMPLETED",
        startedAt: assignment.status === "ASSIGNED" ? now : undefined,
        completedAt: now,
      },
    });
  });

  revalidatePath("/selectors");
  revalidatePath("/selectors/assignments");
  revalidatePath("/staff/selection");

  redirect("/selectors/assignments");
}
