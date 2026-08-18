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
  const name = (
    await ask("Staff name: ")
  ).trim();

  const email = (
    await ask("Staff email: ")
  )
    .trim()
    .toLowerCase();

  const password = await ask(
    "Password (minimum 8 characters): ",
  );

  if (!name || !email || !password) {
    throw new Error(
      "Name, email and password are required.",
    );
  }

  if (password.length < 8) {
    throw new Error(
      "Password must be at least 8 characters.",
    );
  }

  const passwordHash = await bcrypt.hash(
    password,
    8,
  );

  const staffUser =
    await prisma.staffUser.upsert({
      where: {
        email,
      },
      update: {
        name,
        passwordHash,
        role: "ADMIN",
        active: true,
      },
      create: {
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
    console.error("\nUnable to create ADMIN:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    rl.close();
    await prisma.$disconnect();
  });
