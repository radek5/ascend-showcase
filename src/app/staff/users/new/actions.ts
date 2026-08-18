"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireStaffAdmin } from "@/lib/staff/auth";

export async function createStaffUser(
  formData: FormData,
) {
  await requireStaffAdmin();

  const name = String(
    formData.get("name") || "",
  ).trim();

  const email = String(
    formData.get("email") || "",
  )
    .trim()
    .toLowerCase();

  const password = String(
    formData.get("password") || "",
  );

  const role = String(
    formData.get("role") || "STAFF",
  );

  if (!name || !email || !password) {
    throw new Error(
      "Name, email and password are required.",
    );
  }

  if (password.length < 12) {
    throw new Error(
      "Password must be at least 12 characters.",
    );
  }

  if (
    role !== "ADMIN" &&
    role !== "STAFF"
  ) {
    throw new Error("Invalid staff role.");
  }

  const existing =
    await prisma.staffUser.findUnique({
      where: {
        email,
      },
    });

  if (existing) {
    throw new Error(
      "A staff account already exists for this email.",
    );
  }

  const passwordHash =
    await bcrypt.hash(password, 12);

  await prisma.staffUser.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      active: true,
    },
  });

  redirect("/staff/users");
}
