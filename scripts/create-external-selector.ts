import { loadEnvConfig } from "@next/env";
import bcrypt from "bcryptjs";
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
    "selector.test@ascendfootball.com";

  /*
   * DEVELOPMENT TEST ACCOUNT ONLY.
   *
   * We'll replace this manual provisioning
   * with the proper admin invite workflow.
   */
  const temporaryPassword =
    "Ascend-Test-2027!";

  const passwordHash =
    await bcrypt.hash(
      temporaryPassword,
      12
    );

  const selector =
    await prisma.selectorAccount.upsert({
      where: {
        email,
      },

      update: {
        name: "External Test Selector",
        passwordHash,
        active: true,

        // Critical:
        // external selectors have NO StaffUser.
        staffUserId: null,
      },

      create: {
        name: "External Test Selector",
        email,
        passwordHash,
        active: true,
        staffUserId: null,
      },
    });

  console.log("");
  console.log(
    "External selector test account ready."
  );

  console.log({
    id: selector.id,
    name: selector.name,
    email: selector.email,
    active: selector.active,
    staffUserId:
      selector.staffUserId,
  });

  console.log("");
  console.log(
    "Temporary test password:",
    temporaryPassword
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
