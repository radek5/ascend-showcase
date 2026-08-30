"use server";

import { redirect } from "next/navigation";

import {
  deleteSelectorSession,
} from "@/lib/selectors/session";

export async function selectorLogout() {
  await deleteSelectorSession();

  redirect("/selectors/login");
}
