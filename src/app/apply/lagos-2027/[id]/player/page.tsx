import { notFound } from "next/navigation";

import { checkApplicantApplicationAccess } from "@/lib/applicants/applicationOwnership";
import { prisma } from "@/lib/prisma";

import PlayerEditForm from "./player-edit-form";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PlayerEditPage({ params }: PageProps) {
  const { id } = await params;

  const access = await checkApplicantApplicationAccess(id);

  if (!access.authorised) {
    notFound();
  }

  const application = await prisma.showcaseApplication.findUnique({
    where: {
      id: access.applicationId,
    },

    select: {
      id: true,
      eventSlug: true,

      firstName: true,
      lastName: true,

      email: true,
      phone: true,

      dateOfBirth: true,
      sex: true,

      nationality: true,
      addressLine1: true,
      addressLine2: true,
      countryOfResidence: true,
      stateRegion: true,
      city: true,
      postalCode: true,

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

        sex:
          application.sex === "MALE" || application.sex === "FEMALE"
            ? application.sex
            : "",

        dateOfBirth: application.dateOfBirth
          ? application.dateOfBirth.toISOString().slice(0, 10)
          : "",
      }}
    />
  );
}
