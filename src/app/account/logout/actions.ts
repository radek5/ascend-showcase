"use server";

import { redirect } from "next/navigation";

import { deleteApplicantSession } from "@/lib/applicants/session";

export async function applicantLogout() {
  await deleteApplicantSession();

  redirect("/account/login");
}
