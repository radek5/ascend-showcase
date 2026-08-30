import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import PlayerEditForm from "./player-edit-form";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PlayerEditPage({
  params,
}: PageProps) {
  const { id } = await params;

  const application =
    await prisma.showcaseApplication.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
        eventSlug: true,

        firstName: true,
        lastName: true,

        email: true,
        phone: true,

        dateOfBirth: true,
        nationality: true,
        countryOfResidence: true,
        stateRegion: true,
        city: true,

        position: true,
        secondaryPosition: true,
        preferredFoot: true,

        currentClub: true,
        currentAcademy: true,
        footballBackground: true,
      },
    });

  if (!application) {
    notFound();
  }

  return (
    <PlayerEditForm
      application={{
        ...application,

        dateOfBirth:
          application.dateOfBirth
            ? application.dateOfBirth
                .toISOString()
                .slice(0, 10)
            : "",
      }}
    />
  );
}
