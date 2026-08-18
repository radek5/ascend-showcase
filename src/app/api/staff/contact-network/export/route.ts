import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireStaffAdmin } from "@/lib/staff/auth";
import { getAgeAtEvent } from "@/lib/registration/ageAtEvent";

type ContactRow = {
  source: "PLAYER" | "PROFESSIONAL";
  personName: string;
  contactName: string;
  typeLabel: string;
  email: string;
  phone: string;
  event: string;
  detail: string;
  consentAt: Date | null;
};

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  await requireStaffAdmin();

  const { searchParams } = new URL(request.url);

  const q = (searchParams.get("q") || "")
    .trim()
    .toLowerCase();

  const requestedType =
    searchParams.get("type") || "all";

  const type = [
    "all",
    "players",
    "professionals",
    "club-representatives",
    "scouts",
    "agents",
  ].includes(requestedType)
    ? requestedType
    : "all";

  const [players, professionals] =
    await Promise.all([
      prisma.registration.findMany({
        where: {
          futureEventConsent: true,
        },

        include: {
          event: true,
        },
      }),

      prisma.professionalRegistration.findMany({
        where: {
          futureEventConsent: true,
        },

        include: {
          event: true,
        },
      }),
    ]);

  const playerContacts: ContactRow[] =
    players.map((registration) => {
      const { isUnder18AtEvent } =
        getAgeAtEvent(
          registration.dateOfBirth,
          registration.event.footballStartsAt,
        );

      const playerName =
        `${registration.firstName ?? ""} ${registration.lastName ?? ""}`.trim() ||
        "Unnamed Player";

      const isMinor =
        isUnder18AtEvent === true;

      return {
        source: "PLAYER",

        personName: playerName,

        contactName: isMinor
          ? registration.guardianName ||
            "Parent / Guardian"
          : playerName,

        typeLabel: isMinor
          ? "Player - Guardian Contact"
          : "Player",

        email: isMinor
          ? registration.guardianEmail || ""
          : registration.email || "",

        phone: isMinor
          ? registration.guardianPhone || ""
          : registration.phone || "",

        event: registration.event.edition,

        detail:
          registration.primaryPosition ||
          "Player",

        consentAt:
          registration.futureEventConsentAt,
      };
    });

  const professionalContacts: ContactRow[] =
    professionals.map((registration) => ({
      source: "PROFESSIONAL",

      personName: registration.fullName,
      contactName: registration.fullName,

      typeLabel:
        registration.role.replaceAll("_", " "),

      email: registration.email,
      phone: registration.phone,

      event: registration.event.edition,

      detail:
        registration.role.replaceAll("_", " "),

      consentAt:
        registration.futureEventConsentAt,
    }));

  let contacts = [
    ...playerContacts,
    ...professionalContacts,
  ];

  //
  // Same filters as Contact Network
  //

  contacts = contacts.filter((contact) => {
    if (type === "all") return true;

    if (type === "players") {
      return contact.source === "PLAYER";
    }

    if (type === "professionals") {
      return contact.source === "PROFESSIONAL";
    }

    if (type === "club-representatives") {
      return (
        contact.typeLabel ===
        "CLUB REPRESENTATIVE"
      );
    }

    if (type === "scouts") {
      return contact.typeLabel === "SCOUT";
    }

    if (type === "agents") {
      return (
        contact.typeLabel ===
        "FOOTBALL AGENT"
      );
    }

    return true;
  });

  if (q) {
    contacts = contacts.filter((contact) => {
      const haystack = [
        contact.personName,
        contact.contactName,
        contact.email,
        contact.phone,
        contact.typeLabel,
        contact.event,
        contact.detail,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }

  contacts.sort((a, b) => {
    const aTime =
      a.consentAt?.getTime() || 0;

    const bTime =
      b.consentAt?.getTime() || 0;

    return bTime - aTime;
  });

  const header = [
    "Person Name",
    "Contact Name",
    "Contact Type",
    "Email",
    "Phone / WhatsApp",
    "Event",
    "Role / Position",
    "Consent Date",
  ];

  const rows = contacts.map((contact) => [
    contact.personName,
    contact.contactName,
    contact.typeLabel,
    contact.email,

// Force Excel to preserve phone numbers as text.
    contact.phone
      ? `="${contact.phone.replaceAll('"', '""')}"`
      : "",// Force Excel to preserve phone numbers as text.

    contact.event,
    contact.detail,
    contact.consentAt
      ? contact.consentAt.toISOString()
      : "",
  ]);

  const csv = [
    header.map(csvCell).join(","),
    ...rows.map((row) =>
      row.map(csvCell).join(","),
    ),
  ].join("\r\n");

  //
  // UTF-8 BOM helps Excel recognise UTF-8 correctly.
  //
  const output = "\uFEFF" + csv;

  return new NextResponse(output, {
    status: 200,

    headers: {
      "Content-Type":
        "text/csv; charset=utf-8",

      "Content-Disposition":
        'attachment; filename="ascend-contact-network.csv"',

      "Cache-Control": "no-store",
    },
  });
}
