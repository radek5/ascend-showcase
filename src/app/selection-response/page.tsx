import RevelationX1Logo from "@/components/brand/RevelationX1Logo";
import {
  getValidSelectionResponseToken,
  type SelectionResponseTokenPurpose,
} from "@/lib/showcase/selectionResponseTokens";

import { confirmSelectionResponse } from "./actions";

type PageProps = {
  searchParams: Promise<{
    token?: string;
    response?: string;
    result?: string;
  }>;
};

export default async function SelectionResponsePage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  if (params.result === "accepted") {
    return (
      <ResponseShell>
        <StatusCard
          eyebrow="Lagos 2026"
          title="Place Accepted"
          message="Your acceptance has been recorded. Your place at the REVELATIONX1 Lagos 2026 Men's Football Showcase remains secured."
        />
      </ResponseShell>
    );
  }

  if (params.result === "declined") {
    return (
      <ResponseShell>
        <StatusCard
          eyebrow="Lagos 2026"
          title="Place Declined"
          message="Your decision has been recorded and your Lagos 2026 place has been released."
        />
      </ResponseShell>
    );
  }

  if (params.result === "invalid") {
    return (
      <ResponseShell>
        <StatusCard
          eyebrow="Selection Response"
          title="Link No Longer Available"
          message="This selection response link is invalid, has expired, or has already been used. Please contact REVELATIONX1 if you need assistance."
        />
      </ResponseShell>
    );
  }

  const token = params.token?.trim() || "";
  const response =
    params.response === "ACCEPTED" || params.response === "DECLINED"
      ? (params.response as SelectionResponseTokenPurpose)
      : null;

  const responseToken =
    token && response
      ? await getValidSelectionResponseToken(token, response)
      : null;

  if (!responseToken || !response) {
    return (
      <ResponseShell>
        <StatusCard
          eyebrow="Selection Response"
          title="Link No Longer Available"
          message="This selection response link is invalid, has expired, or has already been used. Please contact REVELATIONX1 if you need assistance."
        />
      </ResponseShell>
    );
  }

  const application = responseToken.application;
  const accepting = response === "ACCEPTED";

  return (
    <ResponseShell>
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.025] p-8 sm:p-10">
        <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
          Lagos 2026 Selection Response
        </div>

        <h1 className="mt-5 text-4xl font-black sm:text-5xl">
          {accepting ? "Accept Your Place" : "Decline Your Place"}
        </h1>

        <p className="mt-5 text-base leading-7 text-white/60">
          {accepting
            ? `Please confirm that you accept your place at the REVELATIONX1 Lagos 2026 Men's Football Showcase.`
            : `Please confirm that you wish to decline your place at the REVELATIONX1 Lagos 2026 Men's Football Showcase.`}
        </p>

        <div className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-black/30 p-6 sm:grid-cols-2">
          <Detail
            label="Player"
            value={`${application.firstName} ${application.lastName}`}
          />
          <Detail
            label="Registration Number"
            value={application.registrationNumber || "—"}
          />
        </div>

        {!accepting ? (
          <div className="mt-6 rounded-2xl border border-amber-400/25 bg-amber-400/[0.05] p-5">
            <div className="text-xs font-black uppercase tracking-[0.12em] text-amber-300">
              Important
            </div>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Declining will release your place so that it can be offered to
              another player. This response is final.
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-[#c7ff2f]/25 bg-[#c7ff2f]/[0.05] p-5">
            <p className="text-sm leading-6 text-white/65">
              By confirming, REVELATIONX1 will record that you have accepted
              your Lagos 2026 place.
            </p>
          </div>
        )}

        <form action={confirmSelectionResponse} className="mt-8">
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="response" value={response} />

          <button
            type="submit"
            className={[
              "w-full rounded-full px-6 py-4 text-sm font-black uppercase tracking-[0.12em] transition",
              accepting
                ? "bg-[#c7ff2f] text-black hover:bg-white"
                : "border border-red-400/40 bg-red-500/10 text-red-200 hover:bg-red-500/20",
            ].join(" ")}
          >
            {accepting ? "Confirm Acceptance" : "Confirm Decline"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs leading-5 text-white/35">
          No sign-in is required. This secure link is unique to your selection
          offer.
        </p>
      </div>
    </ResponseShell>
  );
}

function ResponseShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-4xl px-6 py-5">
          <RevelationX1Logo />
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-16">{children}</section>
    </main>
  );
}

function StatusCard({
  eyebrow,
  title,
  message,
}: {
  eyebrow: string;
  title: string;
  message: string;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.025] p-8 sm:p-10">
      <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
        {eyebrow}
      </div>

      <h1 className="mt-5 text-4xl font-black sm:text-5xl">{title}</h1>

      <p className="mt-5 max-w-2xl text-base leading-7 text-white/60">
        {message}
      </p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
        {label}
      </div>
      <div className="mt-2 font-bold text-white">{value}</div>
    </div>
  );
}
