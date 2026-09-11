import "dotenv/config";

import bcrypt from "bcryptjs";
import readline from "node:readline";

import { prisma } from "../src/lib/prisma";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  const databaseUrl =
    process.env.DATABASE_URL || "";

  const isLocalDatabase =
    databaseUrl.includes("localhost") ||
    databaseUrl.includes("127.0.0.1");

  if (!isLocalDatabase) {
    throw new Error(
      "Refusing to bootstrap a staff administrator against a non-local database.",
    );
  }

  const name = (
    await ask("Staff name: ")
  ).trim();

  const email = (
    await ask("Staff email: ")
  )
    .trim()
    .toLowerCase();

  const password = await ask(
    "Password (minimum 12 characters): ",
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

  const staffUser =
    await prisma.staffUser.create({
      data: {
        name,
        email,
        passwordHash,
        role: "ADMIN",
        active: true,
      },
    });

  console.log(
    `\nADMIN account ready: ${staffUser.email}`,
  );
}

main()
  .catch((error) => {
    console.error(
      "\nUnable to create ADMIN:",
    );
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    rl.close();
    await prisma.$disconnect();
  });
