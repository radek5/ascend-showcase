"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import RevelationX1Logo from "@/components/brand/RevelationX1Logo";

const positions = [
  "Goalkeeper",
  "Centre Back",
  "Right Back",
  "Left Back",
  "Defensive Midfielder",
  "Central Midfielder",
  "Attacking Midfielder",
  "Right Winger",
  "Left Winger",
  "Striker",
];

type PlayerSex = "" | "MALE" | "FEMALE";

type Application = {
  id: string;
  eventSlug: string;

  firstName: string;
  lastName: string;

  email: string;
  phone: string | null;

  dateOfBirth: string;
  sex: PlayerSex;

  nationality: string | null;
  countryOfResidence: string | null;
  stateRegion: string | null;
  city: string | null;

  position: string | null;
  secondaryPosition: string | null;
  preferredFoot: string | null;

  currentClub: string | null;
  currentAcademy: string | null;
  footballBackground: string | null;
};

export default function PlayerEditForm({
  application,
}: {
  application: Application;
}) {
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);
    setError("");

    const formData = new FormData(event.currentTarget);

    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(
        `/api/showcase-applications/${application.id}/player`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "We could not update your application.");

        setSubmitting(false);
        return;
      }

      router.push(data.next);
      router.refresh();
    } catch {
      setError("We could not update your application. Please try again.");

      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <RevelationX1Logo />

          <Link
            href={`/apply/${application.eventSlug}/${application.id}/review`}
            className="text-sm font-medium text-white/60 transition hover:text-white"
          >
            Back to review
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-14 lg:px-8">
        <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#c7ff2f]">
          Application Review
        </div>

        <h1 className="mt-3 text-4xl font-black">Edit Player Details</h1>

        <p className="mt-3 text-white/50">
          Update the information below and return to your application review.
          Event eligibility will be checked again when you save.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 grid gap-6 sm:grid-cols-2"
        >
          <Field
            label="First name"
            name="firstName"
            defaultValue={application.firstName}
            required
          />

          <Field
            label="Last name"
            name="lastName"
            defaultValue={application.lastName}
            required
          />

          <label className="space-y-2">
            <span className="text-sm font-semibold">Sex</span>

            <select
              name="sex"
              required
              defaultValue={application.sex}
              className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
            >
              <option value="">Select</option>

              <option value="MALE">Male</option>

              <option value="FEMALE">Female</option>
            </select>

            <p className="text-xs leading-5 text-white/40">
              Lagos 2027 is the Men&apos;s Football Showcase. Changing this may
              affect event eligibility.
            </p>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold">Date of birth</span>

            <input
              name="dateOfBirth"
              type="date"
              required
              defaultValue={application.dateOfBirth}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
            />

            <p className="text-xs leading-5 text-white/40">
              Lagos 2027 requires players to be aged 18–20 on the first day of
              the programme.
            </p>
          </label>

          <Field
            label="Nationality"
            name="nationality"
            defaultValue={application.nationality ?? ""}
            required
          />

          <Field
            label="Country of residence"
            name="countryOfResidence"
            defaultValue={application.countryOfResidence ?? ""}
          />

          <Field
            label="State / Region"
            name="stateRegion"
            defaultValue={application.stateRegion ?? ""}
          />

          <Field
            label="City"
            name="city"
            defaultValue={application.city ?? ""}
          />

          <label className="space-y-2">
            <span className="text-sm font-semibold">Primary position</span>

            <select
              name="position"
              required
              defaultValue={application.position ?? ""}
              className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
            >
              <option value="">Select position</option>

              {positions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold">Preferred foot</span>

            <select
              name="preferredFoot"
              required
              defaultValue={application.preferredFoot ?? ""}
              className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
            >
              <option value="">Select</option>

              <option value="Right">Right</option>

              <option value="Left">Left</option>

              <option value="Both">Both</option>
            </select>
          </label>

          <Field
            label="Secondary position"
            name="secondaryPosition"
            defaultValue={application.secondaryPosition ?? ""}
          />

          <Field
            label="Current club"
            name="currentClub"
            defaultValue={application.currentClub ?? ""}
          />

          <Field
            label="Current academy"
            name="currentAcademy"
            defaultValue={application.currentAcademy ?? ""}
          />

          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-semibold">Football background</span>

            <textarea
              name="footballBackground"
              defaultValue={application.footballBackground ?? ""}
              className="min-h-28 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
            />
          </label>

          <div className="rounded-xl border border-white/10 bg-white/[0.025] p-5 sm:col-span-2">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
              Application Contact
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                label="Email address"
                name="email"
                type="email"
                defaultValue={application.email}
                required
              />

              <Field
                label="Phone"
                name="phone"
                defaultValue={application.phone ?? ""}
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-semibold text-red-200 sm:col-span-2">
              {error}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 sm:col-span-2">
            <Link
              href={`/apply/${application.eventSlug}/${application.id}/review`}
              className="text-sm font-bold text-white/45 transition hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save & Return to Review"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue = "",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold">{label}</span>

      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
      />
    </label>
  );
}
