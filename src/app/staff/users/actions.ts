"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireStaffAdmin } from "@/lib/staff/auth";

export async function updateStaffRole(formData: FormData) {
  await requireStaffAdmin();

  const staffUserId = String(formData.get("staffUserId") || "").trim();

  const role = String(formData.get("role") || "").trim();

  if (!staffUserId) {
    throw new Error("Staff user ID is required.");
  }

  if (role !== "ADMIN" && role !== "STAFF") {
    throw new Error("Invalid staff role.");
  }

  const staffUser = await prisma.staffUser.findUnique({
    where: {
      id: staffUserId,
    },
    select: {
      id: true,
      role: true,
      active: true,
    },
  });

  if (!staffUser) {
    throw new Error("Staff user not found.");
  }

  if (!staffUser.active) {
    throw new Error("Inactive staff users cannot have their role changed.");
  }

  if (staffUser.role === role) {
    redirect("/staff/users");
  }

  if (staffUser.role === "ADMIN" && role === "STAFF") {
    const activeAdminCount = await prisma.staffUser.count({
      where: {
        role: "ADMIN",
        active: true,
      },
    });

    if (activeAdminCount <= 1) {
      redirect("/staff/users?error=last-admin");
    }
  }

  await prisma.staffUser.update({
    where: {
      id: staffUser.id,
    },
    data: {
      role,
    },
  });

  revalidatePath("/staff/users");

  redirect(
    role === "ADMIN"
      ? "/staff/users?success=promoted"
      : "/staff/users?success=demoted",
  );
}

export async function changeStaffPassword(formData: FormData) {
  await requireStaffAdmin();

  const staffUserId = String(formData.get("staffUserId") || "").trim();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!staffUserId) {
    throw new Error("Staff user ID is required.");
  }

  if (password.length < 12) {
    throw new Error("Password must be at least 12 characters.");
  }

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match.");
  }

  const staffUser = await prisma.staffUser.findUnique({
    where: { id: staffUserId },
    select: { id: true, active: true },
  });

  if (!staffUser) {
    throw new Error("Staff user not found.");
  }

  if (!staffUser.active) {
    throw new Error("Cannot change the password of an inactive account.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.staffUser.update({
    where: { id: staffUserId },
    data: {
      passwordHash,
      sessionVersion: { increment: 1 },
    },
  });

  revalidatePath("/staff/users");
  redirect("/staff/users?success=password-changed");
}

export async function removeStaffUser(formData: FormData) {
  const currentAdmin = await requireStaffAdmin();

  const staffUserId = String(formData.get("staffUserId") || "").trim();

  if (!staffUserId) {
    throw new Error("Staff user ID is required.");
  }

  if (staffUserId === currentAdmin.id) {
    redirect("/staff/users?error=remove-self");
  }

  const staffUser = await prisma.staffUser.findUnique({
    where: { id: staffUserId },
    select: {
      id: true,
      role: true,
      active: true,
    },
  });

  if (!staffUser) {
    throw new Error("Staff user not found.");
  }

  if (!staffUser.active) {
    redirect("/staff/users");
  }

  if (staffUser.role === "ADMIN") {
    const activeAdminCount = await prisma.staffUser.count({
      where: {
        role: "ADMIN",
        active: true,
      },
    });

    if (activeAdminCount <= 1) {
      redirect("/staff/users?error=last-admin");
    }
  }

  await prisma.staffUser.update({
    where: { id: staffUserId },
    data: { active: false },
  });

  revalidatePath("/staff/users");
  redirect("/staff/users?success=removed");
}
