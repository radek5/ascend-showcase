"use server";

import { redirect } from "next/navigation";

import { respondToSelectionOfferByToken } from "@/lib/showcase/respondToSelectionOfferByToken";
import type { SelectionResponseTokenPurpose } from "@/lib/showcase/selectionResponseTokens";

export async function confirmSelectionResponse(formData: FormData) {
  const token = String(formData.get("token") || "").trim();
  const response = String(formData.get("response") || "").trim();

  if (!token) {
    redirect("/selection-response?result=invalid");
  }

  if (response !== "ACCEPTED" && response !== "DECLINED") {
    redirect("/selection-response?result=invalid");
  }

  try {
    await respondToSelectionOfferByToken({
      rawToken: token,
      response: response as SelectionResponseTokenPurpose,
    });
  } catch {
    redirect("/selection-response?result=invalid");
  }

  redirect(
    `/selection-response?result=${
      response === "ACCEPTED" ? "accepted" : "declined"
    }`,
  );
}
