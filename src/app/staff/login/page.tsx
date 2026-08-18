import Link from "next/link";

import { staffLogin } from "./actions";

type StaffLoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function StaffLoginPage({
  searchParams,
}: StaffLoginPageProps) {
  const params = await searchParams;

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
            href="/"
            className="text-sm font-medium text-white/50 transition hover:text-white"
          >
            Return to Showcase
          </Link>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-82px)] max-w-7xl items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
            ASCEND Back Office
          </div>

          <h1 className="mt-3 text-4xl font-black">
            Staff Login
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/50">
            Authorised ASCEND staff only. Sign in to manage Showcase
            registrations and operations.
          </p>

          <form
            action={staffLogin}
            className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6"
          >
            {params.error && (
              <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4 text-sm text-red-200">
                {params.error}
              </div>
            )}

            <label className="block">
              <span className="text-sm font-bold">
                Email address
              </span>

              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
              />
            </label>

            <label className="mt-5 block">
              <span className="text-sm font-bold">
                Password
              </span>

              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
              />
            </label>

            <button
              type="submit"
              className="mt-7 w-full rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90"
            >
              Sign In
            </button>
          </form>

          <p className="mt-5 text-center text-xs leading-5 text-white/30">
            Access is restricted to authorised ASCEND personnel.
          </p>
        </div>
      </section>
    </main>
  );
}
