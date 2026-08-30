import Link from "next/link";

import { prisma } from "@/lib/prisma";
import {
  requireSelector,
} from "@/lib/selectors/auth";
import {
  selectorLogout,
} from "../actions/logout";

export default async function SelectorDashboardPage() {
  const selector =
    await requireSelector();

  const [
    assigned,
    inReview,
    completed,
  ] = await Promise.all([
    prisma.selectorAssignment.count({
      where: {
        selectorId: selector.id,
        status: "ASSIGNED",
      },
    }),

    prisma.selectorAssignment.count({
      where: {
        selectorId: selector.id,
        status: "IN_REVIEW",
      },
    }),

    prisma.selectorAssignment.count({
      where: {
        selectorId: selector.id,
        status: "COMPLETED",
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10 bg-[#0b0b0b]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link
            href="/selectors"
            className="flex items-center gap-4"
          >
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
              <span className="block text-lg font-semibold tracking-[0.32em]">
                ASCEND
              </span>

              <span className="block text-[10px] uppercase tracking-[0.22em] text-white/40">
                Selector Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-5">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-bold">
                {selector.name}
              </div>

              <div className="text-xs uppercase tracking-[0.1em] text-white/35">
                Selector
              </div>
            </div>

            <form action={selectorLogout}>
              <button
                type="submit"
                className="rounded-full border border-white/10 px-5 py-2.5 text-xs font-black uppercase tracking-[0.08em] text-white/60"
              >
                Exit Portal
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
          Lagos 2027
        </div>

        <h1 className="mt-3 text-4xl font-black sm:text-5xl">
          Player Assessment
        </h1>

        <p className="mt-4 max-w-2xl text-white/50">
          Review your assigned anonymous player
          assessments and submitted football
          evidence.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          <Metric
            label="Assigned"
            value={assigned}
          />

          <Metric
            label="In Review"
            value={inReview}
          />

          <Metric
            label="Completed"
            value={completed}
          />
        </div>

        <Link
          href="/selectors/assignments"
          className="mt-10 block rounded-[2rem] border border-white/10 bg-white/[0.025] p-8 transition hover:border-[#c7ff2f]/35"
        >
          <div className="text-xs font-black uppercase tracking-[0.18em] text-[#c7ff2f]">
            Assessment Queue
          </div>

          <h2 className="mt-4 text-3xl font-black">
            My Player Assignments
          </h2>

          <p className="mt-3 max-w-xl text-white/50">
            Review video evidence, complete
            structured assessments and submit
            recommendations.
          </p>

          <div className="mt-7 text-sm font-black uppercase tracking-[0.08em] text-[#c7ff2f]">
            Open assessment queue →
          </div>
        </Link>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm leading-6 text-white/45">
          Player names, photographs, contact
          information, representation details and
          commercial information are deliberately
          excluded from this workspace.
        </div>
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
      <div className="text-xs font-black uppercase tracking-[0.12em] text-white/35">
        {label}
      </div>

      <div className="mt-3 text-4xl font-black">
        {value}
      </div>
    </div>
  );
}
