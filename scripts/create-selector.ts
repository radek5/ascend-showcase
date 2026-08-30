import { loadEnvConfig } from "@next/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

loadEnvConfig(process.cwd());

const connectionString =
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not configured."
  );
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const email =
    "radekoya@ascendfootball.com";

  const staff =
    await prisma.staffUser.findUnique({
      where: {
        email,
      },
    });

  if (!staff) {
    throw new Error(
      `Staff user not found: ${email}`
    );
  }

  const selector =
    await prisma.selectorAccount.upsert({
      where: {
        email,
      },

      update: {
        name: staff.name,
        active: true,
        staffUserId: staff.id,
      },

      create: {
        name: staff.name,
        email: staff.email,
        active: true,
        staffUserId: staff.id,

        // Internal staff use the existing
        // staff-session handoff.
        passwordHash: null,
      },
    });

  console.log("");
  console.log("Selector account ready:");
  console.log({
    id: selector.id,
    name: selector.name,
    email: selector.email,
    staffUserId:
      selector.staffUserId,
    active: selector.active,
    passwordHash:
      selector.passwordHash,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
