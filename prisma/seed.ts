import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.event.upsert({
    where: { slug: "lagos-2027" },
    update: {
      active: true,
      registrationOpen: true,
    },
    create: {
      slug: "lagos-2027",
      name: "ASCEND Football Showcase",
      edition: "Lagos 2027",
      city: "Lagos",
      country: "Nigeria",
      venue: "Onikan Stadium",
      registrationOpen: true,
      active: true,
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
