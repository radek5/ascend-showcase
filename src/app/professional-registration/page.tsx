"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import RevelationX1Logo from "@/components/brand/RevelationX1Logo";
import ProfessionalRegistrationProgress from "@/components/professional-registration/ProfessionalRegistrationProgress";
import { updateProfessionalRole } from "./actions/updateProfessionalRole";

function ProfessionalRegistrationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const registrationId =
    searchParams.get("registration") || "";

  const isEditMode = Boolean(registrationId);

  const [role, setRole] = useState("");

  const [registrationAccess, setRegistrationAccess] = useState<
    "LOADING" | "AUTHORISED" | "DENIED"
  >(isEditMode ? "LOADING" : "AUTHORISED");

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    async function loadRegistration() {
      try {
        const response = await fetch(
          `/api/professional-registration/${registrationId}`,
        );

        if (!response.ok) {
          setRegistrationAccess("DENIED");
          return;
        }

        const registration = await response.json();

        if (registration.status !== "DRAFT") {
          setRegistrationAccess("DENIED");
          return;
        }

        setRole(registration.role || "");
        setRegistrationAccess("AUTHORISED");
      } catch (error) {
        console.error(
          "Unable to load professional registration:",
          error,
        );
        setRegistrationAccess("DENIED");
      }
    }

    loadRegistration();
  }, [isEditMode, registrationId]);

  function handleNewRegistrationSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!role) {
      return;
    }

    router.push(
      `/professional-registration/details?role=${encodeURIComponent(role)}`,
    );
  }

  if (registrationAccess === "LOADING") {
    return (
      <main className="min-h-screen bg-[#090909] px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl">
          <div className="text-sm text-white/45">
            Loading registration...
          </div>
        </div>
      </main>
    );
  }

  if (registrationAccess === "DENIED") {
    return (
      <main className="min-h-screen bg-[#090909] px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-black">
            Registration not found
          </h1>
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
            href="/registration"
            className="text-sm font-medium text-white/60 transition hover:text-white"
          >
            Back
          </Link>
        </div>
      </header>

      <section className="border-b border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#c7ff2f]">
            Lagos 2027
          </div>

          <h1 className="mt-3 text-3xl font-black uppercase sm:text-4xl">
            Professional Registration
          </h1>

          <p className="mt-3 max-w-2xl text-white/55">
            Club representatives, scouts and football agents attending Lagos
            2027 must register for event accreditation.
          </p>
        </div>
      </section>

      <ProfessionalRegistrationProgress currentStep={1} />

      <section className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 sm:p-10">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#c7ff2f]">
            Step 1 of 6
          </div>

          <h2 className="mt-3 text-2xl font-black">
            How are you attending?
          </h2>

          <p className="mt-2 text-sm leading-6 text-white/50">
            Select the role that best describes your attendance at the
            showcase.
          </p>

          <form
            action={
              isEditMode
                ? updateProfessionalRole
                : undefined
            }
            onSubmit={
              isEditMode
                ? undefined
                : handleNewRegistrationSubmit
            }
            className="mt-8"
          >
            {isEditMode && (
              <input
                type="hidden"
                name="registrationId"
                value={registrationId}
              />
            )}
            <label className="block space-y-3">
              <span className="text-sm font-semibold">
                I am attending as:
              </span>

              <select
                name="role"
                required
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
              >
                <option value="" disabled>
                  Select role
                </option>
                <option value="CLUB_REPRESENTATIVE">
                  Club Representative
                </option>
                <option value="SCOUT">Scout</option>
                <option value="FOOTBALL_AGENT">
                  Football Agent
                </option>
              </select>
            </label>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={!role}
                className="rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

export default function ProfessionalRegistrationPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#090909] text-white">
          <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
            <div className="text-sm text-white/45">
              Loading registration...
            </div>
          </div>
        </main>
      }
    >
      <ProfessionalRegistrationPageContent />
    </Suspense>
  );
}
