"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { createStaffSession } from "@/lib/staff/session";

export async function registerStaffUser(
  formData: FormData,
) {
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

  const confirmPassword = String(
    formData.get("confirmPassword") || "",
  );

  if (!name || !email || !password) {
    redirect(
      "/staff/register?error=Name%2C%20email%20and%20password%20are%20required.",
    );
  }

  if (password.length < 12) {
    redirect(
      "/staff/register?error=Password%20must%20be%20at%20least%2012%20characters.",
    );
  }

  if (password !== confirmPassword) {
    redirect(
      "/staff/register?error=Passwords%20do%20not%20match.",
    );
  }

  const existing =
    await prisma.staffUser.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

  if (existing) {
    redirect(
      "/staff/register?error=A%20staff%20account%20already%20exists%20for%20this%20email.",
    );
  }

  const passwordHash =
    await bcrypt.hash(password, 12);

  const staffUser = await prisma.$transaction(
    async (tx) => {
      const staffCount =
        await tx.staffUser.count();

      return tx.staffUser.create({
        data: {
          name,
          email,
          passwordHash,
          role:
            staffCount === 0
              ? "ADMIN"
              : "STAFF",
          active: true,
        },
        select: {
          id: true,
          role: true,
        },
      });
    },
  );

  await createStaffSession({
    staffUserId: staffUser.id,
    role: staffUser.role,
  });

  redirect("/staff/dashboard");
}
