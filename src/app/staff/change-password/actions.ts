"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireStaffUser } from "@/lib/staff/auth";
import { deleteStaffSession } from "@/lib/staff/session";

export async function changeMyPassword(formData: FormData) {
  const staffUser = await requireStaffUser();

  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    redirect("/staff/change-password?error=missing-fields");
  }

  if (newPassword.length < 12) {
    redirect("/staff/change-password?error=password-length");
  }

  if (newPassword !== confirmPassword) {
    redirect("/staff/change-password?error=password-mismatch");
  }

  const passwordMatches = await bcrypt.compare(
    currentPassword,
    staffUser.passwordHash,
  );

  if (!passwordMatches) {
    redirect("/staff/change-password?error=invalid-current");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  const updated = await prisma.staffUser.updateMany({
    where: {
      id: staffUser.id,
      active: true,
      passwordHash: staffUser.passwordHash,
      sessionVersion: staffUser.sessionVersion,
    },
    data: {
      passwordHash,
      sessionVersion: { increment: 1 },
    },
  });

  if (updated.count !== 1) {
    redirect("/staff/login");
  }

  await deleteStaffSession();

  redirect("/staff/login?success=password-changed");
}
