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
      active: true,
      registrationOpen: true,

      registrationStartsAt: new Date(
        "2027-01-09T09:00:00+01:00",
      ),

      registrationEndsAt: new Date(
        "2027-01-10T19:00:00+01:00",
      ),

      footballStartsAt: new Date(
        "2027-01-11T09:00:00+01:00",
      ),

      footballEndsAt: new Date(
        "2027-01-15T17:00:00+01:00",
      ),

      registrationFeeAmount: 10000000,
      registrationFeeCurrency: "NGN",
    },

    create: {
      slug: "lagos-2027",

      name: "ASCEND Football Showcase",
      edition: "Lagos 2027",

      city: "Lagos",
      country: "Nigeria",
      venue: "Onikan Stadium",

      registrationStartsAt: new Date(
        "2027-01-09T09:00:00+01:00",
      ),

      registrationEndsAt: new Date(
        "2027-01-10T19:00:00+01:00",
      ),

      footballStartsAt: new Date(
        "2027-01-11T09:00:00+01:00",
      ),

      footballEndsAt: new Date(
        "2027-01-15T17:00:00+01:00",
      ),

      registrationOpen: true,
      active: true,

      registrationFeeAmount: 10000000,
      registrationFeeCurrency: "NGN",
    },
  });

  console.log("✓ Lagos 2027 event seeded");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
