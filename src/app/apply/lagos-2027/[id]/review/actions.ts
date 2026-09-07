"use server";

import { redirect } from "next/navigation";

import {
  checkApplicantApplicationAccess,
  getApplicantApplicationAccessError,
} from "@/lib/applicants/applicationOwnership";
import { finaliseShowcaseApplication } from "@/lib/showcase/finaliseShowcaseApplication";

export async function submitShowcaseApplication(formData: FormData) {
  const applicationId = String(formData.get("applicationId") || "").trim();

  if (!applicationId) {
    throw new Error("Application ID is required.");
  }

  const access = await checkApplicantApplicationAccess(applicationId);

  if (!access.authorised) {
    const accessError = getApplicantApplicationAccessError(access);

    if (accessError.status === 401) {
      redirect("/apply/lagos-2027/account/login");
    }

    throw new Error(accessError.error);
  }

  const result = await finaliseShowcaseApplication({
    applicationId: access.applicationId,
  });

  if (!result.success) {
    redirect(result.redirectPath);
  }

  redirect(`/apply/${result.eventSlug}/${result.applicationId}/confirmation`);
}
