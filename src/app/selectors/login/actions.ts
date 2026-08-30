"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  createSelectorSession,
} from "@/lib/selectors/session";

export async function selectorLogin(
  formData: FormData
) {
  const email = String(
    formData.get("email") || ""
  )
    .trim()
    .toLowerCase();

  const password = String(
    formData.get("password") || ""
  );

  if (!email || !password) {
    redirect(
      "/selectors/login?error=Please%20enter%20your%20email%20and%20password."
    );
  }

  const selector =
    await prisma.selectorAccount.findUnique({
      where: {
        email,
      },
    });

  /*
   * passwordHash is null for ASCEND staff
   * selectors because they enter through their
   * authenticated staff session.
   */
  if (
    !selector ||
    !selector.active ||
    !selector.passwordHash
  ) {
    redirect(
      "/selectors/login?error=Invalid%20email%20or%20password."
    );
  }

  const passwordMatches =
    await bcrypt.compare(
      password,
      selector.passwordHash
    );

  if (!passwordMatches) {
    redirect(
      "/selectors/login?error=Invalid%20email%20or%20password."
    );
  }

  await prisma.selectorAccount.update({
    where: {
      id: selector.id,
    },

    data: {
      lastLoginAt: new Date(),
    },
  });

  await createSelectorSession({
    selectorId: selector.id,
  });

  redirect("/selectors");
}
