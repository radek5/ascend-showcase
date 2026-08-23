import { prisma } from "../src/lib/prisma";

async function main() {
  const event = await prisma.event.findFirst({
    where: {
      active: true,
    },
  });

  if (!event) {
    throw new Error("No active ASCEND event found.");
  }

  const expenseCategories = [
    "Venue",
    "Accommodation",
    "Flights & Travel",
    "Ground Transport",
    "Coaching & Technical Staff",
    "Kit & Equipment",
    "Medical & Safeguarding",
    "Marketing & Media",
    "Technology",
    "Event Staffing",
    "Security",
    "Catering & Hydration",
    "Insurance & Legal",
    "Printing & Accreditation",
    "Other",
  ];

  for (let index = 0; index < expenseCategories.length; index++) {
    const name = expenseCategories[index];

    await prisma.financeCategory.upsert({
      where: {
        eventId_type_name: {
          eventId: event.id,
          type: "EXPENSE",
          name,
        },
      },

      update: {
        sortOrder: index + 1,
      },

      create: {
        eventId: event.id,
        type: "EXPENSE",
        name,
        sortOrder: index + 1,
      },
    });
  }

  console.log(
    `Seeded ${expenseCategories.length} expense categories for ${event.edition}.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
