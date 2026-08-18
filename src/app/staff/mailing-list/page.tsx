import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireStaffAdmin } from "@/lib/staff/auth";
import { getAgeAtEvent } from "@/lib/registration/ageAtEvent";

type MailingListPageProps = {
  searchParams: Promise<{
    q?: string;
    type?: string;
  }>;
};

type ContactRow = {
  id: string;
  source: "PLAYER" | "PROFESSIONAL";
  typeLabel: string;
  personName: string;
  contactName: string;
  email: string;
  phone: string;
  event: string;
  detail: string;
  consentAt: Date | null;
};

export default async function MailingListPage({
  searchParams,
}: MailingListPageProps) {
  await requireStaffAdmin();

  const params = await searchParams;

  const q = (params.q || "").trim().toLowerCase();

  const type =
    params.type &&
    [
      "players",
      "professionals",
      "club-representatives",
      "scouts",
      "agents",
    ].includes(params.type)
      ? params.type
      : "all";

  const [players, professionals] = await Promise.all([
    prisma.registration.findMany({
      where: {
        futureEventConsent: true,
      },

      include: {
        event: true,
      },

      orderBy: {
        futureEventConsentAt: "desc",
      },
    }),

    prisma.professionalRegistration.findMany({
      where: {
        futureEventConsent: true,
      },

      include: {
        event: true,
      },

      orderBy: {
        futureEventConsentAt: "desc",
      },
    }),
  ]);

  const playerContacts: ContactRow[] = players.map(
    (registration) => {
      const { isUnder18AtEvent } = getAgeAtEvent(
        registration.dateOfBirth,
        registration.event.footballStartsAt,
      );

      const playerName =
        `${registration.firstName ?? ""} ${registration.lastName ?? ""}`.trim() ||
        "Unnamed Player";

      const isMinor =
        isUnder18AtEvent === true;

      return {
        id: registration.id,
        source: "PLAYER",
        typeLabel: isMinor
          ? "Player · Guardian Contact"
          : "Player",

        personName: playerName,

        contactName: isMinor
          ? registration.guardianName ||
            "Parent / Guardian"
          : playerName,

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
    },
  );

  const professionalContacts: ContactRow[] =
    professionals.map((registration) => ({
      id: registration.id,
      source: "PROFESSIONAL",
      typeLabel: registration.role.replaceAll(
        "_",
        " ",
      ),

      personName: registration.fullName,
      contactName: registration.fullName,
      email: registration.email,
      phone: registration.phone,

      event: registration.event.edition,

      detail: registration.role.replaceAll(
        "_",
        " ",
      ),

      consentAt:
        registration.futureEventConsentAt,
    }));

  let contacts = [
    ...playerContacts,
    ...professionalContacts,
  ];

  //
  // TYPE FILTER
  //
  contacts = contacts.filter((contact) => {
    if (type === "all") {
      return true;
    }

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
        contact.typeLabel === "FOOTBALL AGENT"
      );
    }

    return true;
  });

  //
  // SEARCH
  //
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

  //
  // MOST RECENT CONSENT FIRST
  //
  contacts.sort((a, b) => {
    const aTime =
      a.consentAt?.getTime() || 0;

    const bTime =
      b.consentAt?.getTime() || 0;

    return bTime - aTime;
  });

  const playerCount =
    playerContacts.length;

  const professionalCount =
    professionalContacts.length;

  const clubRepCount =
    professionalContacts.filter(
      (contact) =>
        contact.typeLabel ===
        "CLUB REPRESENTATIVE",
    ).length;

  const scoutCount =
    professionalContacts.filter(
      (contact) =>
        contact.typeLabel === "SCOUT",
    ).length;

  const agentCount =
    professionalContacts.filter(
      (contact) =>
        contact.typeLabel ===
        "FOOTBALL AGENT",
    ).length;

  const totalCount =
    playerCount + professionalCount;

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <section className="mx-auto max-w-[1500px] px-6 py-12 lg:px-8">

        {/* HEADER */}

        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <Link
              href="/staff/people"
              className="text-sm text-white/40 transition hover:text-white"
            >
              ← Players & Professionals
            </Link>

            <div className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-[#1685ff]">
              ASCEND Network
            </div>

            <h1 className="mt-3 text-4xl font-black">
              Contact Network
            </h1>

            <p className="mt-3 max-w-2xl text-white/50">
              Players, parents, guardians and football
              professionals who have opted in to future ASCEND
              communications.
            </p>
          </div>

        <div className="flex flex-wrap items-center gap-3">
  <Link
    href={`/api/staff/contact-network/export?q=${encodeURIComponent(
      params.q || "",
    )}&type=${encodeURIComponent(type)}`}
    className="rounded-full border border-[#c7ff2f]/30 px-5 py-3 text-xs font-black uppercase tracking-[0.08em] text-[#c7ff2f] transition hover:bg-[#c7ff2f]/10"
  >
    Export CSV
  </Link>

  <div className="rounded-full border border-white/10 bg-white/[0.025] px-5 py-3 text-sm">
    <span className="text-white/40">
      Contacts
    </span>{" "}
    <span className="font-black">
      {contacts.length}
    </span>
  </div>
</div>
        </div>

        {/* SUMMARY */}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <SummaryCard
            label="Total"
            value={totalCount}
            highlight
          />

          <SummaryCard
            label="Players"
            value={playerCount}
          />

          <SummaryCard
            label="Professionals"
            value={professionalCount}
          />

          <SummaryCard
            label="Club Reps"
            value={clubRepCount}
          />

          <SummaryCard
            label="Scouts"
            value={scoutCount}
          />

          <SummaryCard
            label="Agents"
            value={agentCount}
          />
        </div>

        {/* FILTERS */}

        <form className="mt-10 flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <input
            type="text"
            name="q"
            defaultValue={params.q || ""}
            placeholder="Search name, email, phone, role or event"
            className="min-w-[300px] flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#1685ff]/60"
          />

          <select
            name="type"
            defaultValue={type}
            className="min-w-[220px] rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm outline-none focus:border-[#1685ff]/60"
          >
            <option value="all">
              All contacts
            </option>

            <option value="players">
              Players / Guardians
            </option>

            <option value="professionals">
              All Professionals
            </option>

            <option value="club-representatives">
              Club Representatives
            </option>

            <option value="scouts">
              Scouts
            </option>

            <option value="agents">
              Football Agents
            </option>
          </select>

          <button
            type="submit"
            className="rounded-full bg-[#1685ff] px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-white"
          >
            Apply
          </button>

          <Link
            href="/staff/mailing-list"
            className="rounded-full border border-white/10 px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-white/50 transition hover:text-white"
          >
            Clear
          </Link>
        </form>

        {/* CONTACT TABLE */}

        <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-[1250px] w-full border-collapse text-sm">
            <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-[0.08em] text-white/35">
              <tr>
                <th className="px-5 py-4">
                  Person
                </th>

                <th className="px-5 py-4">
                  Contact
                </th>

                <th className="px-5 py-4">
                  Type
                </th>

                <th className="px-5 py-4">
                  Email
                </th>

                <th className="px-5 py-4">
                  WhatsApp / Phone
                </th>

                <th className="px-5 py-4">
                  Event
                </th>

                <th className="px-5 py-4">
                  Role / Position
                </th>

                <th className="px-5 py-4">
                  Opted In
                </th>
              </tr>
            </thead>

            <tbody>
              {contacts.map((contact) => (
                <tr
                  key={`${contact.source}-${contact.id}`}
                  className="border-t border-white/5 transition hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-5">
                    <div className="font-black">
                      {contact.personName}
                    </div>

                    <div className="mt-1 text-xs font-bold uppercase tracking-[0.08em] text-white/30">
                      {contact.source}
                    </div>
                  </td>

                  <td className="px-5 py-5">
                    <div className="font-semibold">
                      {contact.contactName}
                    </div>

                    {contact.contactName !==
                      contact.personName && (
                      <div className="mt-1 text-xs text-[#c7ff2f]">
                        Parent / Guardian
                      </div>
                    )}
                  </td>

                  <td className="px-5 py-5">
                    <span className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.05em] text-white/60">
                      {contact.typeLabel}
                    </span>
                  </td>

                  <td className="px-5 py-5">
                    {contact.email ? (
                      <a
                        href={`mailto:${contact.email}`}
                        className="font-semibold text-white transition hover:text-[#1685ff]"
                      >
                        {contact.email}
                      </a>
                    ) : (
                      <span className="text-white/30">
                        Not provided
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-5">
                    {contact.phone ? (
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-white/60 transition hover:text-white"
                      >
                        {contact.phone}
                      </a>
                    ) : (
                      <span className="text-white/30">
                        Not provided
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-5 text-white/60">
                    {contact.event}
                  </td>

                  <td className="px-5 py-5 font-semibold">
                    {contact.detail}
                  </td>

                  <td className="px-5 py-5">
                    <div className="font-black text-[#c7ff2f]">
                      OPTED IN
                    </div>

                    <div className="mt-1 text-xs text-white/35">
                      {contact.consentAt
                        ? new Intl.DateTimeFormat(
                            "en-GB",
                            {
                              dateStyle: "medium",
                              timeStyle: "short",
                            },
                          ).format(
                            contact.consentAt,
                          )
                        : "Date unavailable"}
                    </div>
                  </td>
                </tr>
              ))}

              {contacts.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-16 text-center text-white/35"
                  >
                    No opted-in contacts match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PRIVACY NOTE */}

        <div className="mt-8 rounded-2xl border border-[#1685ff]/15 bg-[#1685ff]/[0.04] p-5">
          <div className="text-xs font-black uppercase tracking-[0.12em] text-[#1685ff]">
            Contact Governance
          </div>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/50">
            This network contains only registrations where future
            ASCEND communications were explicitly selected. For
            players under 18 at the event, the parent or guardian
            contact is used instead of marketing directly to the
            player.
          </p>
        </div>
      </section>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <div className="text-xs font-black uppercase tracking-[0.1em] text-white/35">
        {label}
      </div>

      <div
        className={`mt-2 text-3xl font-black ${
          highlight
            ? "text-[#c7ff2f]"
            : "text-white"
        }`}
      >
        {value.toLocaleString("en-GB")}
      </div>
    </div>
  );
}
