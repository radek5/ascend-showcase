import "server-only";

import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const configuredSecret =
    process.env.STAFF_ADMIN_BOOTSTRAP_SECRET;

  if (!configuredSecret) {
    return NextResponse.json(
      { error: "Bootstrap is not enabled." },
      { status: 404 },
    );
  }

  const suppliedSecret =
    request.headers.get("x-bootstrap-secret");

  if (
    !suppliedSecret ||
    suppliedSecret !== configuredSecret
  ) {
    return NextResponse.json(
      { error: "Not authorised." },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("name" in body) ||
    !("email" in body) ||
    !("password" in body) ||
    typeof body.name !== "string" ||
    typeof body.email !== "string" ||
    typeof body.password !== "string"
  ) {
    return NextResponse.json(
      { error: "Name, email and password are required." },
      { status: 400 },
    );
  }

  const name = body.name.trim();
  const email = body.email.trim().toLowerCase();
  const password = body.password;

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email and password are required." },
      { status: 400 },
    );
  }

  if (password.length < 12) {
    return NextResponse.json(
      { error: "Password must be at least 12 characters." },
      { status: 400 },
    );
  }

  const passwordHash =
    await bcrypt.hash(password, 12);

  try {
    const staffUser =
      await prisma.$transaction(
        async (tx) => {
          const existingStaffCount =
            await tx.staffUser.count();

          if (existingStaffCount !== 0) {
            throw new Error(
              "STAFF_BOOTSTRAP_ALREADY_COMPLETED",
            );
          }

          return tx.staffUser.create({
            data: {
              name,
              email,
              passwordHash,
              role: "ADMIN",
              active: true,
            },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              active: true,
            },
          });
        },
        {
          isolationLevel: "Serializable",
        },
      );

    return NextResponse.json(
      {
        created: true,
        staffUser,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "First staff admin bootstrap failed:",
      error,
    );

    return NextResponse.json(
      { error: "Unable to create first staff administrator." },
      { status: 409 },
    );
  }
}
