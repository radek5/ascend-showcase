"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import RevelationX1Logo from "@/components/brand/RevelationX1Logo";

const steps = [
  "Player",
  "Contact",
  "Identity",
  "Club & Academy",
  "Representation",
  "Video",
  "Consent",
  "Review",
  "Confirmation",
];

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

type AgeResult = {
  age: number;
  eligible: boolean;
  reason: "AGE_ELIGIBLE" | "AGE_TOO_YOUNG" | "AGE_TOO_OLD";
} | null;

function getAgeResult(dobValue: string): AgeResult {
  if (!dobValue) {
    return null;
  }

  const dob = new Date(`${dobValue}T00:00:00.000Z`);

  if (Number.isNaN(dob.getTime())) {
    return null;
  }

  /*
   * UI convenience only.
   *
   * The API remains authoritative and obtains
   * footballStartsAt and eligibility configuration
   * from the Event record.
   *
   * Lagos 2027 currently starts:
   * 11 January 2027.
   */
  const eventDate = new Date("2027-01-11T08:00:00.000Z");

  let age = eventDate.getUTCFullYear() - dob.getUTCFullYear();

  const birthdayPassed =
    eventDate.getUTCMonth() > dob.getUTCMonth() ||
    (eventDate.getUTCMonth() === dob.getUTCMonth() &&
      eventDate.getUTCDate() >= dob.getUTCDate());

  if (!birthdayPassed) {
    age -= 1;
  }

  if (age < 18) {
    return {
      age,
      eligible: false,
      reason: "AGE_TOO_YOUNG",
    };
  }

  if (age > 20) {
    return {
      age,
      eligible: false,
      reason: "AGE_TOO_OLD",
    };
  }

  return {
    age,
    eligible: true,
    reason: "AGE_ELIGIBLE",
  };
}

export default function Lagos2027StartApplicationPage() {
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [dateOfBirth, setDateOfBirth] = useState("");

  const [sex, setSex] = useState<PlayerSex>("");

  const ageResult = getAgeResult(dateOfBirth);

  const sexEligible = sex === "MALE";

  const canProceed = Boolean(ageResult?.eligible && sexEligible);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!sex) {
      setError("Please select the player's sex.");
      return;
    }

    if (!sexEligible) {
      setError(
        "Lagos 2027 is the Men's Football Showcase and is open to eligible male players.",
      );
      return;
    }

    if (!ageResult?.eligible) {
      setError(
        "You must meet the Lagos 2027 age requirement before continuing.",
      );
      return;
    }

    setSubmitting(true);
    setError("");

    const formData = new FormData(event.currentTarget);

    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/showcase-applications", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "We could not create your application.");

        setSubmitting(false);
        return;
      }

      router.push(
        data.next || `/apply/lagos-2027/${data.application.id}/contact`,
      );
    } catch {
      setError("We could not create your application. Please try again.");

      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <RevelationX1Logo />

          <Link
            href="/apply/lagos-2027"
            className="text-sm font-medium text-white/60 transition hover:text-white"
          >
            Back to application
          </Link>
        </div>
      </header>

      <section className="border-b border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#c7ff2f]">
            Lagos 2027
          </div>

          <h1 className="mt-3 text-3xl font-black uppercase sm:text-4xl">
            REVELATIONX1 Football Showcase
          </h1>

          <p className="mt-3 max-w-2xl text-white/55">
            Apply for professional football assessment and selection for the
            inaugural REVELATIONX1 Lagos 2027 Football Showcase.
          </p>

          <div className="mt-5 inline-flex rounded-full border border-[#c7ff2f]/20 bg-[#c7ff2f]/[0.06] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#c7ff2f]">
            Male players · Ages 18–20
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl overflow-x-auto px-6 lg:px-8">
          <div className="flex min-w-[1180px]">
            {steps.map((step, index) => (
              <div
                key={step}
                className="flex flex-1 items-center gap-2 border-r border-white/10 py-5 pr-4 first:pl-0"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                    index === 0
                      ? "bg-[#c7ff2f] text-black"
                      : "border border-white/15 text-white/40"
                  }`}
                >
                  {["1", "2", "3", "4A", "4B", "5", "6", "7", "8"][index]}
                </div>

                <span
                  className={`text-[10px] font-bold uppercase tracking-[0.08em] ${
                    index === 0 ? "text-white" : "text-white/35"
                  }`}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1fr_340px] lg:px-8">
        <div>
          <div className="mb-8">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#c7ff2f]">
              Step 1 of 8
            </div>

            <h2 className="mt-3 text-3xl font-black">Player Details</h2>

            <p className="mt-2 text-sm text-white/50">
              Tell us about the player applying for assessment.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-2">
            <Field label="First name" name="firstName" required />

            <Field label="Last name" name="lastName" required />

            <label className="space-y-2">
              <span className="text-sm font-semibold">Sex</span>

              <select
                name="sex"
                required
                value={sex}
                onChange={(event) => {
                  setSex(event.target.value as PlayerSex);

                  setError("");
                }}
                className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
              >
                <option value="">Select</option>

                <option value="MALE">Male</option>

                <option value="FEMALE">Female</option>
              </select>

              <p className="text-xs leading-5 text-white/40">
                Lagos 2027 is the Men&apos;s Football Showcase and is open to
                eligible male players.
              </p>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold">Date of birth</span>

              <input
                name="dateOfBirth"
                type="date"
                required
                value={dateOfBirth}
                onChange={(event) => {
                  setDateOfBirth(event.target.value);

                  setError("");
                }}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
              />

              <p className="text-xs leading-5 text-white/40">
                You must be aged 18–20 on the first day of the programme, 11
                January 2027.
              </p>
            </label>

            {sex ? (
              <div
                className={`rounded-xl border p-4 ${
                  sexEligible
                    ? "border-[#c7ff2f]/25 bg-[#c7ff2f]/[0.06]"
                    : "border-red-400/25 bg-red-400/[0.08]"
                }`}
              >
                {sexEligible ? (
                  <>
                    <div className="text-sm font-black text-[#c7ff2f]">
                      ✓ Men&apos;s Showcase eligibility
                    </div>

                    <p className="mt-1 text-xs leading-5 text-white/55">
                      You meet the competition category requirement for Lagos
                      2027.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-black text-red-300">
                      ✕ Not eligible for this event
                    </div>

                    <p className="mt-1 text-xs leading-5 text-red-100/70">
                      Lagos 2027 is the Men&apos;s Football Showcase and is open
                      to eligible male players.
                    </p>

                    <p className="mt-2 text-xs font-semibold leading-5 text-white/50">
                      A dedicated women&apos;s programme is planned as part of
                      the Showcase&apos;s future expansion.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                <div className="text-sm font-bold text-white/60">
                  Competition category
                </div>

                <p className="mt-1 text-xs leading-5 text-white/40">
                  Select the player&apos;s sex to confirm eligibility for this
                  event.
                </p>
              </div>
            )}

            {ageResult ? (
              <div
                className={`rounded-xl border p-4 ${
                  ageResult.eligible
                    ? "border-[#c7ff2f]/25 bg-[#c7ff2f]/[0.06]"
                    : "border-red-400/25 bg-red-400/[0.08]"
                }`}
              >
                {ageResult.eligible ? (
                  <>
                    <div className="text-sm font-black text-[#c7ff2f]">
                      ✓ Age eligible
                    </div>

                    <p className="mt-1 text-xs leading-5 text-white/55">
                      You will be {ageResult.age} years old on the first day of
                      the programme and meet the 18–20 age requirement.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-black text-red-300">
                      ✕ Not age eligible
                    </div>

                    <p className="mt-1 text-xs leading-5 text-red-100/70">
                      {ageResult.reason === "AGE_TOO_YOUNG"
                        ? `You will be ${ageResult.age} years old on the first day of the programme and are below the minimum age of 18.`
                        : `You will be ${ageResult.age} years old on the first day of the programme and are above the maximum age of 20.`}
                    </p>

                    <p className="mt-2 text-xs font-semibold leading-5 text-white/50">
                      This application cannot proceed.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                <div className="text-sm font-bold text-white/60">
                  Age eligibility
                </div>

                <p className="mt-1 text-xs leading-5 text-white/40">
                  Enter the player&apos;s date of birth to confirm the 18–20 age
                  requirement.
                </p>
              </div>
            )}

            <Field label="Nationality" name="nationality" required />

            <label className="space-y-2">
              <span className="text-sm font-semibold">Primary position</span>

              <select
                name="position"
                required
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
                className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
              >
                <option value="">Select</option>

                <option value="Right">Right</option>

                <option value="Left">Left</option>

                <option value="Both">Both</option>
              </select>
            </label>

            <Field label="Secondary position" name="secondaryPosition" />

            <Field label="Current club or academy" name="currentClub" />

            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-semibold">Football background</span>

              <textarea
                name="footballBackground"
                placeholder="Briefly tell us about your football experience, teams, academies, competitions or playing history..."
                className="min-h-28 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none transition placeholder:text-white/25 focus:border-[#c7ff2f]/60"
              />
            </label>

            {/*
              Temporary application contact fields.

              We currently require an email when
              creating the ShowcaseApplication
              record. These will later be moved
              fully into Step 2 — Contact.
            */}
            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-5 sm:col-span-2">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
                Application Contact
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Email address"
                  name="email"
                  type="email"
                  required
                />

                <Field label="Phone" name="phone" />
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/55 sm:col-span-2">
              Next, you&apos;ll provide your contact and representation
              information before submitting your football video for professional
              assessment.
            </div>

            {error ? (
              <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-semibold text-red-200 sm:col-span-2">
                {error}
              </div>
            ) : null}

            <div className="mt-4 flex justify-end sm:col-span-2">
              <button
                type="submit"
                disabled={submitting || !canProceed}
                className="rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Saving..."
                  : sex && !sexEligible
                    ? "Not Eligible"
                    : ageResult && !ageResult.eligible
                      ? "Not Eligible"
                      : "Continue"}
              </button>
            </div>
          </form>
        </div>

        <aside>
          <div className="sticky top-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/40">
              Your Application
            </div>

            <div className="mt-5 text-xl font-black">
              REVELATIONX1 Football Showcase
            </div>

            <div className="mt-1 text-[#c7ff2f]">Lagos 2027</div>

            <div className="mt-6 space-y-4 border-t border-white/10 pt-6 text-sm">
              <div className="flex justify-between gap-6">
                <span className="text-white/40">Category</span>

                <span className="text-right">Men&apos;s</span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-white/40">Eligibility</span>

                <span className="text-right">Male · Ages 18–20</span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-white/40">Assessment</span>

                <span className="text-right">Football profile + video</span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-white/40">Selection</span>

                <span className="text-right">Best 100 eligible players</span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-white/40">Camp</span>

                <span className="text-right">Fully funded if selected</span>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-[#c7ff2f]/15 bg-[#c7ff2f]/[0.05] p-4">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-[#c7ff2f]">
                Important
              </div>

              <p className="mt-3 text-sm leading-6 text-white/60">
                The Application &amp; Assessment Fee pays for the processing and
                professional assessment of your application and submitted video.
              </p>

              <p className="mt-3 text-sm font-bold leading-6 text-white">
                Payment does not guarantee selection or an invitation to the
                Lagos 2027 camp.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold">{label}</span>

      <input
        type={type}
        name={name}
        required={required}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none transition placeholder:text-white/25 focus:border-[#c7ff2f]/60"
      />
    </label>
  );
}
