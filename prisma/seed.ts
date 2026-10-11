import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.event.upsert({
    where: {
      slug: "lagos-2027",
    },

    update: {
      name: "REVELATIONX1 Football Showcase",
      edition: "Lagos 2026",

      city: "Lagos",
      country: "Nigeria",
      venue: "Gbagada Stadium",

      active: true,
      registrationOpen: true,

      registrationStartsAt: new Date("2026-12-05T09:00:00+01:00"),

      registrationEndsAt: new Date("2026-12-06T19:00:00+01:00"),

      footballStartsAt: new Date("2026-12-07T09:00:00+01:00"),

      footballEndsAt: new Date("2026-12-11T17:00:00+01:00"),

      registrationFeeAmount: 0,
      registrationFeeCurrency: "NGN",
    },

    create: {
      slug: "lagos-2027",

      name: "REVELATIONX1 Football Showcase",
      edition: "Lagos 2026",

      city: "Lagos",
      country: "Nigeria",
      venue: "Gbagada Stadium",

      registrationStartsAt: new Date("2026-12-05T09:00:00+01:00"),

      registrationEndsAt: new Date("2026-12-06T19:00:00+01:00"),

      footballStartsAt: new Date("2026-12-07T09:00:00+01:00"),

      footballEndsAt: new Date("2026-12-11T17:00:00+01:00"),

      registrationOpen: true,
      active: true,

      registrationFeeAmount: 0,
      registrationFeeCurrency: "NGN",
    },
  });

  console.log("✓ Lagos 2026 event seeded");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
