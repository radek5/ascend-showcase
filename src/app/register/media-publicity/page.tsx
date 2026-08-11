import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getAgeAtEvent } from "@/lib/registration/ageAtEvent";
import { updateMediaPublicity } from "../actions/updateMediaPublicity";

type MediaPageProps = {
  searchParams: Promise<{
    registration?: string;
  }>;
};

export default async function MediaPublicityPage({
  searchParams,
}: MediaPageProps) {
  const params = await searchParams;
  const registrationId = params.registration;

  if (!registrationId) {
    notFound();
  }

  const registration = await prisma.registration.findUnique({
    where: {
      id: registrationId,
    },
    include: {
      event: true,
    },
  });

  if (!registration) {
    notFound();
  }

  const { ageAtEvent, isUnder18AtEvent } = getAgeAtEvent(
    registration.dateOfBirth,
    registration.event.footballStartsAt,
  );

  if (isUnder18AtEvent === null) {
    throw new Error(
      "Unable to determine player age at event.",
    );
  }

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link href="/" className="flex items-center gap-4">
            <svg
              viewBox="0 0 54 54"
              className="h-10 w-10"
              fill="none"
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
            href={`/register/declarations?registration=${registration.id}`}
            className="text-sm text-white/60 hover:text-white"
          >
            Back
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1fr_340px] lg:px-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#c7ff2f]">
            Step 7 of 10
          </div>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Media & Publicity
          </h1>

          <p className="mt-3 max-w-2xl text-white/55">
            Please review how photographs, video and the player&apos;s name or
            image may be used in connection with the ASCEND Football Showcase.
          </p>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="text-lg font-black">
              Photography, Video & Publicity
            </div>

            <div className="mt-4 space-y-4 text-sm leading-7 text-white/55">
              <p>
                ASCEND may photograph or record players during registration,
                coaching sessions, training, matches, assessments,
                presentations and other Showcase activities.
              </p>

              <p>
                These materials may include the player&apos;s name, photograph,
                image, likeness, voice and football activity.
              </p>

              <p>
                Approved material may be used for ASCEND event coverage,
                websites and digital platforms, social media, promotional
                materials, brochures, press and media coverage, sponsor-related
                event coverage and promotion of future ASCEND events.
              </p>
            </div>
          </div>

          {isUnder18AtEvent && (
            <div className="mt-6 rounded-2xl border border-[#c7ff2f]/20 bg-[#c7ff2f]/[0.05] p-5">
              <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
                Parent / Guardian Permission
              </div>

              <div className="mt-2 text-lg font-bold">
                {registration.guardianName}
              </div>

              <p className="mt-3 text-sm leading-6 text-white/60">
                Because the player is under 18, this media and publicity choice
                must be made by the parent or legal guardian.
              </p>
            </div>
          )}

          <form
            action={updateMediaPublicity}
            className="mt-8"
          >
            <input
              type="hidden"
              name="registrationId"
              value={registration.id}
            />

            <div className="space-y-4">
              <label className="flex cursor-pointer gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <input
                  type="radio"
                  name="mediaConsent"
                  value="yes"
                  required
                  defaultChecked={registration.mediaConsent === true}
                  className="mt-1"
                />

                <div>
                  <div className="font-bold">
                    Media & Publicity Authorised
                  </div>

            <p className="mt-2 text-sm leading-6 text-white/55">
  {isUnder18AtEvent ? (
    <>
      I authorise ASCEND to use{" "}
      <span className="text-white">
        {registration.firstName} {registration.lastName}
      </span>
      &apos;s name, image, photographs and appropriate video footage
      for the media and publicity purposes described above.
    </>
  ) : (
    <>
      I authorise ASCEND to use my name, image, photographs and
      appropriate video footage for the media and publicity purposes
      described above.
    </>
  )}
</p>
                </div>
              </label>

              <label className="flex cursor-pointer gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <input
                  type="radio"
                  name="mediaConsent"
                  value="no"
                  required
                  defaultChecked={registration.mediaConsent === false}
                  className="mt-1"
                />

                <div>
                  <div className="font-bold">
                    Media & Publicity Not Authorised
                  </div>

            <p className="mt-2 text-sm leading-6 text-white/55">
              {isUnder18AtEvent ? (
               <>
                 I do not authorise ASCEND to use{" "}
                 <span className="text-white">
                   {registration.firstName} {registration.lastName}
                 </span>
                 &apos;s name, identifiable image, photographs or video footage
                 for promotional or publicity purposes.
              </>
             ) : (
               <>
                I do not authorise ASCEND to use my name, identifiable image,
                photographs or video footage for promotional or publicity
                purposes.
               </>
              )}
            </p>
                </div>
              </label>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                className="rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black"
              >
                Continue to Review
              </button>
            </div>
          </form>
        </div>

        <aside>
          <div className="sticky top-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/40">
              Player
            </div>

            <div className="mt-5 text-xl font-black">
              {registration.firstName} {registration.lastName}
            </div>

            <div className="mt-1 text-[#c7ff2f]">
              {registration.event.edition}
            </div>

            <div className="mt-6 border-t border-white/10 pt-6 text-sm">
              <div className="flex justify-between gap-6">
                <span className="text-white/40">
                  Age at event
                </span>

                <span>
                  {ageAtEvent !== null
                    ? `${ageAtEvent} ${
                        isUnder18AtEvent ? "(U18)" : "(18+)"
                      }`
                    : "Unavailable"}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
