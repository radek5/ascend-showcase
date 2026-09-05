"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RevelationX1Logo from "@/components/brand/RevelationX1Logo";

type Application = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  age: number | null;

  stateRegion: string | null;
  city: string | null;

  emergencyContactName: string | null;
  emergencyContactRelationship: string | null;
  emergencyContactPhone: string | null;

  position: string | null;
};

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

export default function ContactPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const id = params.id;

  const [application, setApplication] = useState<Application | null>(null);

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

        setApplication(data.application);
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

    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`/api/showcase-applications/${id}/contact`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "We could not save your contact information.");
        setSubmitting(false);
        return;
      }

      router.push(data.next);
    } catch {
      setError("We could not save your contact information.");
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
                    index === 1
                      ? "bg-[#c7ff2f] text-black"
                      : index < 1
                        ? "bg-white/10 text-white"
                        : "border border-white/15 text-white/40"
                  }`}
                >
                  {["1", "2", "3", "4A", "4B", "5", "6", "7", "8"][index]}
                </div>

                <span
                  className={`text-[10px] font-bold uppercase tracking-[0.08em] ${
                    index === 1 ? "text-white" : "text-white/35"
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
            Step 2 of 8
          </div>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">Contact</h1>

          <p className="mt-3 max-w-2xl text-white/55">
            Add the player&apos;s contact details and emergency contact
            information.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-10 grid gap-6 sm:grid-cols-2"
          >
            <Field
              label="Email"
              name="email"
              type="email"
              required
              defaultValue={application.email}
            />

            <Field
              label="Phone / WhatsApp"
              name="phone"
              type="tel"
              required
              defaultValue={application.phone || ""}
            />

            <div className="sm:col-span-2 border-t border-white/10 pt-8">
              <div className="text-lg font-black">Location</div>

              <p className="mt-2 text-sm text-white/45">
                Tell us where you are currently based. This helps us understand
                where applicants are travelling from and plan Showcase
                logistics.
              </p>
            </div>

            <Field
              label="State / Region"
              name="stateRegion"
              required
              defaultValue={application.stateRegion || ""}
            />

            <Field
              label="City"
              name="city"
              required
              defaultValue={application.city || ""}
            />

            <div className="sm:col-span-2 border-t border-white/10 pt-8">
              <div className="text-lg font-black">Emergency Contact</div>

              <p className="mt-2 text-sm text-white/45">
                Provide someone REVELATIONX1 can contact in an emergency.
              </p>
            </div>

            <Field
              label="Emergency contact name"
              name="emergencyContactName"
              required
              defaultValue={application.emergencyContactName || ""}
            />

            <Field
              label="Relationship"
              name="emergencyContactRelationship"
              required
              defaultValue={application.emergencyContactRelationship || ""}
            />

            <Field
              label="Emergency contact phone"
              name="emergencyContactPhone"
              type="tel"
              required
              defaultValue={application.emergencyContactPhone || ""}
            />

            {error ? (
              <div className="sm:col-span-2 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-semibold text-red-200">
                {error}
              </div>
            ) : null}

            <div className="mt-4 flex items-center justify-between sm:col-span-2">
              <Link
                href={`/apply/lagos-2027/${id}/player?from=contact`}
                className="text-sm font-bold text-white/50 transition hover:text-white"
              >
                ← Back
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Continue"}
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
              {application.firstName} {application.lastName}
            </div>

            <div className="mt-1 text-[#c7ff2f]">Lagos 2027</div>

            <div className="mt-6 space-y-4 border-t border-white/10 pt-6 text-sm">
              <div className="flex justify-between gap-6">
                <span className="text-white/40">Position</span>

                <span>{application.position || "—"}</span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-white/40">Age</span>

                <span>{application.age ?? "—"}</span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-white/40">Selection</span>

                <span>Best 100</span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-white/40">Status</span>

                <span>DRAFT</span>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-[#c7ff2f]/15 bg-[#c7ff2f]/[0.05] p-4 text-sm leading-6 text-white/60">
              Your application is saved as you move through each stage.
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
      <span className="text-sm font-semibold">{label}</span>

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
