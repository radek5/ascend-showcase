import "server-only";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getSelectorSession } from "./session";

export async function getCurrentSelector() {
  const session =
    await getSelectorSession();

  if (!session) {
    return null;
  }

  const selector =
    await prisma.selectorAccount.findUnique({
      where: {
        id: session.selectorId,
      },
    });

  if (!selector || !selector.active) {
    return null;
  }

  return selector;
}

export async function requireSelector() {
  const selector =
    await getCurrentSelector();

  if (!selector) {
    redirect("/selectors/login");
  }

  return selector;
}
