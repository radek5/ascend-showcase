import Link from "next/link";

import RevelationX1Logo from "@/components/brand/RevelationX1Logo";
import { requireVerifiedApplicantUser } from "@/lib/applicants/auth";
import { prisma } from "@/lib/prisma";
import { getApplicationSubmissionReadiness } from "@/lib/showcase/getApplicationSubmissionReadiness";

import { applicantLogout } from "./logout/actions";

const LAGOS_2027_EVENT_SLUG = "lagos-2027";

export default async function ApplicantAccountPage() {
  const applicantUser = await requireVerifiedApplicantUser();

  const application = await prisma.showcaseApplication.findFirst({
    where: {
      userId: applicantUser.id,
      eventSlug: LAGOS_2027_EVENT_SLUG,
    },

    select: {
      id: true,
      eventSlug: true,
      firstName: true,
      lastName: true,
      status: true,
      submittedAt: true,
      registrationNumber: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const legacyDraft = application
    ? null
    : await prisma.showcaseApplication.findFirst({
        where: {
          userId: null,
          eventSlug: LAGOS_2027_EVENT_SLUG,
          status: "DRAFT",
          submittedAt: null,
          email: {
            equals: applicantUser.email,
            mode: "insensitive",
          },
        },

        select: {
          id: true,
        },
      });

  let applicationHref = "/apply/lagos-2027/start";
  let applicationAction = legacyDraft
    ? "Recover Application"
    : "Start Application";

  if (application) {
    if (application.submittedAt) {
      applicationHref = `/apply/${application.eventSlug}/${application.id}/confirmation`;
      applicationAction = "View Application Status";
    } else {
      const readiness = await getApplicationSubmissionReadiness(application.id);

      applicationHref =
        readiness?.redirectPath ||
        `/apply/${application.eventSlug}/${application.id}/review`;

      applicationAction = "Continue Application";
    }
  }

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5 lg:px-8">
          <RevelationX1Logo />

          <form action={applicantLogout}>
            <button
              type="submit"
              className="text-sm font-semibold text-white/50 transition hover:text-white"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-14 lg:px-8 lg:py-20">
        <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
          Applicant Account
        </div>

        <h1 className="mt-3 text-4xl font-black sm:text-5xl">
          Your REVELATIONX1 account
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
          <span className="text-white/45">Signed in as</span>

          <span className="font-bold text-white">{applicantUser.email}</span>

          <span className="rounded-full border border-[#c7ff2f]/20 bg-[#c7ff2f]/[0.06] px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-[#c7ff2f]">
            Email Verified
          </span>
        </div>

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-[#c7ff2f]">
                Lagos 2027
              </div>

              <h2 className="mt-3 text-2xl font-black">
                Men&apos;s Football Showcase
              </h2>

              {!application ? (
                legacyDraft ? (
                  <>
                    <p className="mt-4 max-w-2xl leading-7 text-white/55">
                      We found an unfinished Lagos 2027 application associated
                      with your verified email address. Continue to Step 1 to
                      confirm your application details and securely reconnect it
                      to your account.
                    </p>

                    <div className="mt-5 inline-flex rounded-full border border-[#c7ff2f]/20 bg-[#c7ff2f]/[0.06] px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-[#c7ff2f]">
                      Unfinished application found
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mt-4 max-w-2xl leading-7 text-white/55">
                      You have not started your Lagos 2027 application yet.
                      Applications are free and 100 players will be selected on
                      ability following the application and screening process.
                    </p>

                    <div className="mt-5 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white/55">
                      Male players · Ages 18–20
                    </div>
                  </>
                )
              ) : application.submittedAt ? (
                <>
                  <p className="mt-4 max-w-2xl leading-7 text-white/55">
                    Your Lagos 2027 application has been submitted and is now
                    part of the REVELATIONX1 assessment and selection process.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <StatusBadge>Submitted</StatusBadge>

                    {application.registrationNumber ? (
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold text-white/60">
                        {application.registrationNumber}
                      </span>
                    ) : null}
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-4 max-w-2xl leading-7 text-white/55">
                    Your application is saved. Continue from where you stopped
                    and complete all required stages before submitting it for
                    assessment.
                  </p>

                  <div className="mt-5">
                    <StatusBadge>Application in progress</StatusBadge>
                  </div>
                </>
              )}
            </div>

            <Link
              href={applicationHref}
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#c7ff2f] px-7 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90"
            >
              {applicationAction}
            </Link>
          </div>

          {application ? (
            <div className="mt-8 grid gap-4 border-t border-white/10 pt-7 sm:grid-cols-2">
              <AccountDetail
                label="Applicant"
                value={
                  [application.firstName, application.lastName]
                    .filter(Boolean)
                    .join(" ") || "Application started"
                }
              />

              <AccountDetail
                label="Application status"
                value={
                  application.submittedAt
                    ? "Submitted — Under Assessment"
                    : "Draft — In Progress"
                }
              />
            </div>
          ) : null}
        </section>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm leading-6 text-white/45">
          Keep your account details secure. Your applicant account is used to
          save your progress and provide access to your REVELATIONX1
          application.
        </div>
      </section>
    </main>
  );
}

function StatusBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full border border-[#c7ff2f]/20 bg-[#c7ff2f]/[0.06] px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-[#c7ff2f]">
      {children}
    </span>
  );
}

function AccountDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-xs font-bold uppercase tracking-[0.12em] text-white/30">
        {label}
      </div>

      <div className="mt-2 font-bold text-white/75">{value}</div>
    </div>
  );
}
