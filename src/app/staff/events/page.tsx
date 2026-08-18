import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireStaffAdmin } from "@/lib/staff/auth";

import {
  createEvent,
  setActiveEvent,
  toggleRegistrationOpen,
} from "./actions";

export default async function EventsPage() {
  await requireStaffAdmin();

  const events = await prisma.event.findMany({
    include: {
      _count: {
        select: {
          registrations: true,
          scouts: true,
          introductions: true,
        },
      },
    },

    orderBy: [
      {
        active: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <Link
          href="/staff/dashboard"
          className="text-sm text-white/40 transition hover:text-white"
        >
          ← Back Office
        </Link>

        <div className="mt-6">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
            Administration
          </div>

          <h1 className="mt-3 text-4xl font-black">
            Event Management
          </h1>

          <p className="mt-3 max-w-2xl text-white/50">
            Create and manage current and future ASCEND Football Showcase events.
          </p>
        </div>

        <div className="mt-10 space-y-5">
          {events.map((event) => (
            <section
              key={event.id}
              className="rounded-2xl border border-white/10 bg-white/[0.025] p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-black">
                      {event.edition}
                    </h2>

                    {event.active && (
                      <span className="rounded-full border border-[#c7ff2f]/30 bg-[#c7ff2f]/[0.06] px-3 py-1 text-xs font-black uppercase tracking-[0.06em] text-[#c7ff2f]">
                        Active
                      </span>
                    )}

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.06em] ${
                        event.registrationOpen
                          ? "border-[#c7ff2f]/30 text-[#c7ff2f]"
                          : "border-white/10 text-white/40"
                      }`}
                    >
                      Registration{" "}
                      {event.registrationOpen
                        ? "Open"
                        : "Closed"}
                    </span>
                  </div>

                  <div className="mt-2 text-sm text-white/45">
                    {event.city}, {event.country}
                    {" · "}
                    {event.venue}
                  </div>

                  <div className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
                    <Info
                      label="Players"
                      value={event._count.registrations}
                    />

                    <Info
                      label="Scouts"
                      value={event._count.scouts}
                    />

                    <Info
                      label="Introductions"
                      value={
                        event._count.introductions
                      }
                    />
                  </div>

                  <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <Info
                      label="Football starts"
                      value={formatDate(
                        event.footballStartsAt,
                      )}
                    />

                    <Info
                      label="Football ends"
                      value={formatDate(
                        event.footballEndsAt,
                      )}
                    />

                    <Info
                      label="Capacity"
                      value={
                        event.capacity ?? "—"
                      }
                    />

                    <Info
                      label="Fee"
                      value={
                        event.registrationFeeAmount !==
                        null
                          ? formatMoney(
                              event.registrationFeeAmount,
                              event.registrationFeeCurrency,
                            )
                          : "—"
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {!event.active && (
                    <form action={setActiveEvent}>
                      <input
                        type="hidden"
                        name="eventId"
                        value={event.id}
                      />

                      <button
                        type="submit"
                        className="rounded-full border border-[#c7ff2f]/30 px-5 py-2.5 text-xs font-black uppercase tracking-[0.06em] text-[#c7ff2f]"
                      >
                        Make Active
                      </button>
                    </form>
                  )}

                  <form
                    action={
                      toggleRegistrationOpen
                    }
                  >
                    <input
                      type="hidden"
                      name="eventId"
                      value={event.id}
                    />

                    <input
                      type="hidden"
                      name="currentlyOpen"
                      value={String(
                        event.registrationOpen,
                      )}
                    />

                    <button
                      type="submit"
                      className="rounded-full border border-white/10 px-5 py-2.5 text-xs font-black uppercase tracking-[0.06em] text-white/60"
                    >
                      {event.registrationOpen
                        ? "Close Registration"
                        : "Open Registration"}
                    </button>
                  </form>
                </div>
              </div>
            </section>
          ))}

          {events.length === 0 && (
            <div className="rounded-2xl border border-white/10 px-6 py-16 text-center text-white/35">
              No ASCEND events have been created.
            </div>
          )}
        </div>

        <section className="mt-12 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
          <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
            New Event
          </div>

          <h2 className="mt-2 text-2xl font-black">
            Create ASCEND Event
          </h2>

          <form
            action={createEvent}
            className="mt-8 grid gap-5 md:grid-cols-2"
          >
            <Field
              label="Event name"
              name="name"
              placeholder="ASCEND Football Showcase"
              required
            />

            <Field
              label="Edition"
              name="edition"
              placeholder="Lagos 2028"
              required
            />

            <Field
              label="Slug"
              name="slug"
              placeholder="lagos-2028"
              required
            />

            <Field
              label="City"
              name="city"
              placeholder="Lagos"
              required
            />

            <Field
              label="Country"
              name="country"
              placeholder="Nigeria"
              required
            />

            <Field
              label="Venue"
              name="venue"
              placeholder="Venue name"
              required
            />

            <Field
              label="Registration venue"
              name="registrationVenue"
              placeholder="Optional"
            />

            <Field
              label="Capacity"
              name="capacity"
              type="number"
              placeholder="500"
            />

            <Field
              label="Registration opens"
              name="registrationStartsAt"
              type="datetime-local"
            />

            <Field
              label="Registration closes"
              name="registrationEndsAt"
              type="datetime-local"
            />

            <Field
              label="Football starts"
              name="footballStartsAt"
              type="datetime-local"
            />

            <Field
              label="Football ends"
              name="footballEndsAt"
              type="datetime-local"
            />

            <Field
              label="Registration fee"
              name="registrationFeeAmount"
              type="number"
              placeholder="100000"
            />

            <label>
              <div className="text-sm font-bold">
                Currency
              </div>

              <select
                name="registrationFeeCurrency"
                defaultValue="NGN"
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#111] px-4 py-4"
              >
                <option value="NGN">
                  NGN
                </option>
                <option value="GBP">
                  GBP
                </option>
                <option value="USD">
                  USD
                </option>
                <option value="EUR">
                  EUR
                </option>
              </select>
            </label>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black"
              >
                Create Event
              </button>
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label>
      <div className="text-sm font-bold">
        {label}
      </div>

      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-4 outline-none focus:border-[#c7ff2f]/60"
      />
    </label>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.08em] text-white/30">
        {label}
      </div>

      <div className="mt-1 font-bold text-white/70">
        {value}
      </div>
    </div>
  );
}

function formatDate(
  value: Date | null,
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      dateStyle: "medium",
    },
  ).format(value);
}

function formatMoney(
  amountInMinorUnits: number,
  currency: string,
) {
  try {
    return new Intl.NumberFormat(
      "en-GB",
      {
        style: "currency",
        currency,
      },
    ).format(
      amountInMinorUnits / 100,
    );
  } catch {
    return `${currency} ${(
      amountInMinorUnits / 100
    ).toFixed(2)}`;
  }
}
