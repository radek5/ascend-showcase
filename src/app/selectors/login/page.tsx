import Link from "next/link";

import { selectorLogin } from "./actions";

type Props = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function SelectorLoginPage({
  searchParams,
}: Props) {
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
                Selector Portal
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="text-sm text-white/50 transition hover:text-white"
          >
            Return to Showcase
          </Link>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-82px)] max-w-7xl items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
            Lagos 2027
          </div>

          <h1 className="mt-3 text-4xl font-black">
            Selector Login
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/50">
            Authorised ASCEND football selectors only.
          </p>

          <form
            action={selectorLogin}
            className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6"
          >
            {params.error ? (
              <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4 text-sm text-red-200">
                {params.error}
              </div>
            ) : null}

            <label className="block">
              <span className="text-sm font-bold">
                Email address
              </span>

              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-4 outline-none focus:border-[#c7ff2f]/60"
              />
            </label>

            <label className="mt-5 block">
              <span className="text-sm font-bold">
                Password
              </span>

              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-4 outline-none focus:border-[#c7ff2f]/60"
              />
            </label>

            <button
              type="submit"
              className="mt-7 w-full rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black"
            >
              Enter Selector Portal
            </button>
          </form>

          <p className="mt-5 text-center text-xs leading-5 text-white/30">
            Player identity and personal contact
            information are not available within
            the Selector Portal.
          </p>
        </div>
      </section>
    </main>
  );
}
