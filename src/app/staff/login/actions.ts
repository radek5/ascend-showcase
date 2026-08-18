"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { createStaffSession } from "@/lib/staff/session";

export async function staffLogin(formData: FormData) {
  const email = String(
    formData.get("email") || "",
  )
    .trim()
    .toLowerCase();

  const password = String(
    formData.get("password") || "",
  );

  if (!email || !password) {
    redirect(
      "/staff/login?error=Please%20enter%20your%20email%20and%20password.",
    );
  }

  const staffUser = await prisma.staffUser.findUnique({
    where: {
      email,
    },
  });

  if (!staffUser || !staffUser.active) {
    redirect(
      "/staff/login?error=Invalid%20email%20or%20password.",
    );
  }

  const passwordMatches = await bcrypt.compare(
    password,
    staffUser.passwordHash,
  );

  if (!passwordMatches) {
    redirect(
      "/staff/login?error=Invalid%20email%20or%20password.",
    );
  }

  await prisma.staffUser.update({
    where: {
      id: staffUser.id,
    },
    data: {
      lastLoginAt: new Date(),
    },
  });

  await createStaffSession({
    staffUserId: staffUser.id,
    role: staffUser.role,
  });

  redirect("/staff/dashboard");
}
