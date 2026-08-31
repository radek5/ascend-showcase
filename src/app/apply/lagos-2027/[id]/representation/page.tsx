"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

const steps = [
  "Player",
  "Contact",
  "Representation",
  "Video",
  "Consent",
  "Review",
  "Assessment Fee",
  "Payment",
  "Confirmation",
];

type Application = {
  id: string;
  firstName: string;
  lastName: string;
  position: string | null;
  age: number | null;

  hasAgent: boolean | null;

  interestedInAscendRepresentation:
    | boolean
    | null;

  agentName: string | null;
  agencyName: string | null;
  agentEmail: string | null;
  agentPhone: string | null;
  agentCountry: string | null;
  fifaLicenceNumber: string | null;

  representationStart: string | null;
  representationEnd: string | null;

  exclusiveRepresentation: string | null;

  agentContactConsent: boolean;
};

export default function RepresentationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const id = params.id;

  const [application, setApplication] =
    useState<Application | null>(null);

  const [hasAgent, setHasAgent] =
    useState<"yes" | "no" | "">("");

  const [
    ascendRepresentationInterest,
    setAscendRepresentationInterest,
  ] = useState<"yes" | "no" | "">("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(
          `/api/showcase-applications/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.error ||
              "Application not found."
          );
          return;
        }

        const record =
          data.application as Application;

        setApplication(record);

        if (record.hasAgent === true) {
          setHasAgent("yes");
        }

        if (record.hasAgent === false) {
          setHasAgent("no");
        }

        if (
          record.interestedInAscendRepresentation ===
          true
        ) {
          setAscendRepresentationInterest("yes");
        }

        if (
          record.interestedInAscendRepresentation ===
          false
        ) {
          setAscendRepresentationInterest("no");
        }
      } catch {
        setError(
          "We could not load your application."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSubmitting(true);
    setError("");

    const formData = new FormData(
      event.currentTarget
    );

    const payload: Record<
      string,
      string | boolean
    > = Object.fromEntries(
      formData.entries()
    ) as Record<string, string>;

    payload.hasAgent = hasAgent;

    payload.ascendRepresentationInterest =
      ascendRepresentationInterest;

    payload.contactAuthorised =
      formData.get("contactAuthorised") ===
      "on";

    payload.declarationConfirmed =
      formData.get("declarationConfirmed") ===
      "on";

    try {
      const response = await fetch(
        `/api/showcase-applications/${id}/representation`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "We could not save your representation information."
        );
        setSubmitting(false);
        return;
      }

      router.push(data.next);
    } catch {
      setError(
        "We could not save your representation information."
      );
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#090909] px-6 py-16 text-white">
        Loading application...
      </main>
    );
  }

  if (!application) {
    return (
      <main className="min-h-screen bg-[#090909] px-6 py-16 text-white">
        <h1 className="text-3xl font-black">
          Application not found
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-4"
          >
            <svg
              viewBox="0 0 54 54"
              className="h-10 w-10"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M27 3 49 46 27 35 5 46 27 3Z"
                fill="#1685ff"
              />

              <path
                d="M27 15 38 37 27 31 16 37 27 15Z"
                fill="#020812"
              />
            </svg>

            <div>
              <span className="block text-lg font-semibold tracking-[0.36em]">
                ASCEND
              </span>

              <span className="block text-[10px] uppercase tracking-[0.28em] text-white/45">
                Football Showcase
              </span>
            </div>
          </Link>

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
                    index === 2
                      ? "bg-[#c7ff2f] text-black"
                      : index < 2
                        ? "bg-white/10 text-white"
                        : "border border-white/15 text-white/40"
                  }`}
                >
                  {index + 1}
                </div>

                <span
                  className={`text-[10px] font-bold uppercase tracking-[0.08em] ${
                    index === 2
                      ? "text-white"
                      : "text-white/35"
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
            Step 3 of 10
          </div>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Representation
          </h1>

          <p className="mt-3 max-w-2xl text-white/55">
            Tell us whether the player is
            currently represented by a football
            agent or intermediary.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-10"
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <div className="text-lg font-black">
                Are you currently represented?
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Choice
                  title="No"
                  description="I am not currently represented."
                  selected={hasAgent === "no"}
                  onClick={() => {
                    setHasAgent("no");
                    setAscendRepresentationInterest(
                      ""
                    );
                  }}
                />

                <Choice
                  title="Yes"
                  description="I currently have an agent or representative."
                  selected={hasAgent === "yes"}
                  onClick={() =>
                    setHasAgent("yes")
                  }
                />
              </div>
            </div>

            {hasAgent === "no" ? (
              <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                <div className="text-lg font-black">
                  Would you like ASCEND to contact
                  you about representation?
                </div>

                <p className="mt-2 text-sm leading-6 text-white/50">
                  ASCEND provides professional
                  football agent representation and
                  career support for selected players.
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Choice
                    title="Yes"
                    description="I would like ASCEND to contact me about representation."
                    selected={
                      ascendRepresentationInterest ===
                      "yes"
                    }
                    onClick={() =>
                      setAscendRepresentationInterest(
                        "yes"
                      )
                    }
                  />

                  <Choice
                    title="No"
                    description="I am not interested at this time."
                    selected={
                      ascendRepresentationInterest ===
                      "no"
                    }
                    onClick={() =>
                      setAscendRepresentationInterest(
                        "no"
                      )
                    }
                  />
                </div>

                <div className="mt-5 rounded-xl border border-[#c7ff2f]/15 bg-[#c7ff2f]/[0.05] p-4 text-xs leading-5 text-white/45">
                  Selecting Yes is an expression of
                  interest only and does not appoint
                  ASCEND as your football agent. Any
                  representation would be discussed
                  and agreed separately.
                </div>
              </div>
            ) : null}

            {hasAgent === "yes" ? (
              <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                <div className="text-lg font-black">
                  Agent Details
                </div>

                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <Field
                    label="Agent full name"
                    name="agentName"
                    required
                    defaultValue={
                      application.agentName || ""
                    }
                  />

                  <Field
                    label="Agency name"
                    name="agencyName"
                    defaultValue={
                      application.agencyName || ""
                    }
                  />

                  <Field
                    label="Agent email"
                    name="agentEmail"
                    type="email"
                    defaultValue={
                      application.agentEmail || ""
                    }
                  />

                  <Field
                    label="Agent phone / WhatsApp"
                    name="agentPhone"
                    type="tel"
                    defaultValue={
                      application.agentPhone || ""
                    }
                  />

                  <Field
                    label="Country"
                    name="agentCountry"
                    defaultValue={
                      application.agentCountry || ""
                    }
                  />

                  <Field
                    label="FIFA licence number"
                    name="fifaLicenceNumber"
                    placeholder="If known"
                    defaultValue={
                      application.fifaLicenceNumber ||
                      ""
                    }
                  />

                  <Field
                    label="Representation start date"
                    name="representationStartDate"
                    type="date"
                    defaultValue={
                      application.representationStart
                        ? application.representationStart.slice(
                            0,
                            10
                          )
                        : ""
                    }
                  />

                  <Field
                    label="Representation end date"
                    name="representationEndDate"
                    type="date"
                    defaultValue={
                      application.representationEnd
                        ? application.representationEnd.slice(
                            0,
                            10
                          )
                        : ""
                    }
                  />

                  <label className="space-y-2 sm:col-span-2">
                    <span className="text-sm font-semibold">
                      Is the representation exclusive?
                    </span>

                    <select
                      name="exclusive"
                      defaultValue={
                        application.exclusiveRepresentation ||
                        ""
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-4 outline-none focus:border-[#c7ff2f]/60"
                    >
                      <option value="">
                        Select
                      </option>
                      <option value="yes">
                        Yes
                      </option>
                      <option value="no">
                        No
                      </option>
                      <option value="unknown">
                        Not sure
                      </option>
                    </select>
                  </label>
                </div>

                <label className="mt-6 flex gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
                  <input
                    type="checkbox"
                    name="contactAuthorised"
                    defaultChecked={
                      application.agentContactConsent
                    }
                    className="mt-1"
                  />

                  <span className="text-sm leading-6 text-white/60">
                    I authorise ASCEND to contact
                    this representative regarding
                    opportunities arising from the
                    Showcase.
                  </span>
                </label>
              </div>
            ) : null}

            <label className="mt-8 flex gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <input
                type="checkbox"
                name="declarationConfirmed"
                required
                className="mt-1"
              />

              <span className="text-sm leading-6 text-white/60">
                I confirm that the representation
                information provided is accurate to
                the best of my knowledge.
              </span>
            </label>

            {error ? (
              <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-semibold text-red-200">
                {error}
              </div>
            ) : null}

            <div className="mt-8 flex items-center justify-between">
              <Link
                href={`/apply/lagos-2027/${id}/contact`}
                className="text-sm font-bold text-white/50 transition hover:text-white"
              >
                ← Back
              </Link>

              <button
                type="submit"
                disabled={
                  !hasAgent ||
                  submitting
                }
                className="rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting
                  ? "Saving..."
                  : "Continue"}
              </button>
            </div>
          </form>
        </div>

        <aside>
          <div className="sticky top-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/40">
              Application
            </div>

            <div className="mt-5 text-xl font-black">
              {application.firstName}{" "}
              {application.lastName}
            </div>

            <div className="mt-1 text-[#c7ff2f]">
              Lagos 2027
            </div>

            <div className="mt-6 space-y-4 border-t border-white/10 pt-6 text-sm">
              <div className="flex justify-between gap-6">
                <span className="text-white/40">
                  Position
                </span>
                <span>
                  {application.position || "—"}
                </span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-white/40">
                  Age
                </span>
                <span>
                  {application.age ?? "—"}
                </span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-white/40">
                  Selection
                </span>
                <span>Best 100</span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-white/40">
                  Status
                </span>
                <span>DRAFT</span>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-[#c7ff2f]/15 bg-[#c7ff2f]/[0.05] p-4 text-sm leading-6 text-white/60">
              Your application is saved as you move
              through each stage.
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function Choice({
  title,
  description,
  selected,
  onClick,
}: {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-5 text-left transition ${
        selected
          ? "border-[#c7ff2f]/70 bg-[#c7ff2f]/[0.07]"
          : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <div className="font-black">
        {title}
      </div>

      <div className="mt-1 text-sm text-white/45">
        {description}
      </div>
    </button>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  defaultValue = "",
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold">
        {label}
      </span>

      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none transition placeholder:text-white/20 focus:border-[#c7ff2f]/60"
      />
    </label>
  );
}
