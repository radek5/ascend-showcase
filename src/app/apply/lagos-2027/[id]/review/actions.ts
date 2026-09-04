"use server";

import { redirect } from "next/navigation";

import { finaliseShowcaseApplication } from "@/lib/showcase/finaliseShowcaseApplication";

export async function submitShowcaseApplication(formData: FormData) {
  const applicationId = String(formData.get("applicationId") || "").trim();

  if (!applicationId) {
    throw new Error("Application ID is required.");
  }

  const result = await finaliseShowcaseApplication({
    applicationId,
  });

  if (!result.success) {
    redirect(result.redirectPath);
  }

  redirect(`/apply/${result.eventSlug}/${result.applicationId}/confirmation`);
}
