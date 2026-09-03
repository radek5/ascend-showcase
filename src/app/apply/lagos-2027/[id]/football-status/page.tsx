"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

type Application = {
  id: string;

  firstName: string;
  lastName: string;

  currentClub: string | null;
  currentClubStartDate: string | null;
  currentClubEndDate: string | null;

  currentAcademy: string | null;
  currentAcademyStartDate: string | null;
  currentAcademyEndDate: string | null;
};

function formatDateForInput(value: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

export default function FootballStatusPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const id = params.id;

  const [application, setApplication] = useState<Application | null>(null);

  const [currentlyAtClub, setCurrentlyAtClub] = useState(false);

  const [currentlyAtAcademy, setCurrentlyAtAcademy] = useState(false);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplication() {
      try {
        const response = await fetch(`/api/showcase-applications/${id}`);

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Application not found.");

          return;
        }

        const record = data.application as Application;

        setApplication(record);

        if (
          record.currentClub &&
          record.currentClubStartDate &&
          !record.currentClubEndDate
        ) {
          setCurrentlyAtClub(true);
        }

        if (
          record.currentAcademy &&
          record.currentAcademyStartDate &&
          !record.currentAcademyEndDate
        ) {
          setCurrentlyAtAcademy(true);
        }
      } catch {
        setError("We could not load your application.");
      } finally {
        setLoading(false);
      }
    }

    loadApplication();
  }, [id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);
    setError("");

    const formData = new FormData(event.currentTarget);

    const payload: Record<string, string | boolean> = Object.fromEntries(
      formData.entries(),
    ) as Record<string, string>;

    payload.currentlyAtClub = currentlyAtClub;

    payload.currentlyAtAcademy = currentlyAtAcademy;

    try {
      const response = await fetch(
        `/api/showcase-applications/${id}/football-status`,
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
        setError(
          data.error || "We could not save your club and academy information.",
        );

        setSubmitting(false);

        return;
      }

      router.push(data.next);
    } catch {
      setError("We could not save your club and academy information.");

      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#090909] px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl text-white/50">
          Loading application...
        </div>
      </main>
    );
  }

  if (!application) {
    return (
      <main className="min-h-screen bg-[#090909] px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-black">Application not found</h1>

          {error ? <p className="mt-3 text-red-300">{error}</p> : null}
        </div>
      </main>
    );
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

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl overflow-x-auto px-6 lg:px-8">
          <div className="flex min-w-[1050px]">
            {steps.map((step, index) => (
              <div
                key={step}
                className="flex flex-1 items-center gap-2 border-r border-white/10 py-5 pr-3"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                    index === 3
                      ? "bg-[#c7ff2f] text-black"
                      : index < 3
                        ? "bg-white/10 text-white"
                        : "border border-white/15 text-white/40"
                  }`}
                >
                  {["1", "2", "3", "4A", "4B", "5", "6", "7", "8"][index]}
                </div>

                <span
                  className={`text-[10px] font-bold uppercase tracking-[0.08em] ${
                    index === 3 ? "text-white" : "text-white/35"
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
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#c7ff2f]">
            Step 4A of 8
          </div>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Club &amp; Academy Status
          </h1>

          <p className="mt-3 max-w-2xl text-white/55">
            Tell us about your current or most recent club and academy
            relationships.
          </p>

          <div className="mt-6 max-w-2xl rounded-2xl border border-[#c7ff2f]/20 bg-[#c7ff2f]/5 p-5">
            <p className="text-sm leading-6 text-white/70">
              Having a current or previous club or academy relationship does not
              automatically prevent you from being selected. Please provide
              accurate information so existing football relationships can be
              properly understood and respected.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-8">
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#c7ff2f]">
                  Club
                </div>

                <h2 className="mt-2 text-xl font-black">
                  Current or most recent club
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/45">
                  If you have a current or previous club, enter the details
                  below. Otherwise, leave this section blank.
                </p>
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field
                    label="Club name"
                    name="currentClub"
                    defaultValue={application.currentClub || ""}
                  />
                </div>

                <Field
                  label="Start date"
                  name="currentClubStartDate"
                  type="date"
                  defaultValue={formatDateForInput(
                    application.currentClubStartDate,
                  )}
                />

                <Field
                  label="End date"
                  name="currentClubEndDate"
                  type="date"
                  disabled={currentlyAtClub}
                  defaultValue={formatDateForInput(
                    application.currentClubEndDate,
                  )}
                />

                <label className="sm:col-span-2 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <input
                    type="checkbox"
                    name="currentlyAtClub"
                    checked={currentlyAtClub}
                    onChange={(event) =>
                      setCurrentlyAtClub(event.target.checked)
                    }
                    className="mt-1 h-4 w-4 accent-[#c7ff2f]"
                  />

                  <span>
                    <span className="block text-sm font-bold">
                      I am currently with this club
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-white/45">
                      You do not need to enter an end date if you are still with
                      this club.
                    </span>
                  </span>
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#c7ff2f]">
                  Academy
                </div>

                <h2 className="mt-2 text-xl font-black">
                  Current or most recent academy
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/45">
                  If you have a current or previous academy, enter the details
                  below. Otherwise, leave this section blank.
                </p>
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field
                    label="Academy name"
                    name="currentAcademy"
                    defaultValue={application.currentAcademy || ""}
                  />
                </div>

                <Field
                  label="Start date"
                  name="currentAcademyStartDate"
                  type="date"
                  defaultValue={formatDateForInput(
                    application.currentAcademyStartDate,
                  )}
                />

                <Field
                  label="End date"
                  name="currentAcademyEndDate"
                  type="date"
                  disabled={currentlyAtAcademy}
                  defaultValue={formatDateForInput(
                    application.currentAcademyEndDate,
                  )}
                />

                <label className="sm:col-span-2 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <input
                    type="checkbox"
                    name="currentlyAtAcademy"
                    checked={currentlyAtAcademy}
                    onChange={(event) =>
                      setCurrentlyAtAcademy(event.target.checked)
                    }
                    className="mt-1 h-4 w-4 accent-[#c7ff2f]"
                  />

                  <span>
                    <span className="block text-sm font-bold">
                      I am currently with this academy
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-white/45">
                      You do not need to enter an end date if you are still with
                      this academy.
                    </span>
                  </span>
                </label>
              </div>
            </section>

            {error ? (
              <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href={`/apply/lagos-2027/${id}/identity`}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 px-6 text-sm font-bold text-white/70 transition hover:border-white/30 hover:text-white"
              >
                Back
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#c7ff2f] px-7 text-sm font-black text-black transition hover:bg-[#d5ff62] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Continue to Representation"}
              </button>
            </div>
          </form>
        </div>

        <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#c7ff2f]">
            Your application
          </div>

          <div className="mt-4 text-xl font-black">
            {application.firstName} {application.lastName}
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-white/35">
              This stage
            </div>

            <p className="mt-2 text-sm leading-6 text-white/55">
              We use this information to understand existing football
              relationships before selection and verification.
            </p>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs leading-5 text-white/45">
              Club or academy attachment does not automatically affect your
              football assessment.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: string;
};

function Field({
  label,
  name,
  type = "text",
  required = false,
  disabled = false,
  defaultValue = "",
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-white/75">
        {label}
        {required ? <span className="ml-1 text-[#c7ff2f]">*</span> : null}
      </span>

      <input
        type={type}
        name={name}
        required={required}
        disabled={disabled}
        defaultValue={defaultValue}
        className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#c7ff2f]/60 disabled:cursor-not-allowed disabled:opacity-35"
      />
    </label>
  );
}
