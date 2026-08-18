import "server-only";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getStaffSession } from "./session";

export async function getCurrentStaffUser() {
  const session = await getStaffSession();

  if (!session) {
    return null;
  }

  const staffUser =
    await prisma.staffUser.findUnique({
      where: {
        id: session.staffUserId,
      },
    });

  if (!staffUser || !staffUser.active) {
    return null;
  }

  return staffUser;
}

export async function requireStaffUser() {
  const staffUser =
    await getCurrentStaffUser();

  if (!staffUser) {
    redirect("/staff/login");
  }

  return staffUser;
}

export async function requireStaffAdmin() {
  const staffUser =
    await requireStaffUser();

  if (staffUser.role !== "ADMIN") {
    redirect("/staff/dashboard");
  }

  return staffUser;
}
