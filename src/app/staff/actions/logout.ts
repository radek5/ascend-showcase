"use server";

import { redirect } from "next/navigation";
import { deleteStaffSession } from "@/lib/staff/session";

export async function staffLogout() {
  await deleteStaffSession();
  redirect("/staff/login");
}
