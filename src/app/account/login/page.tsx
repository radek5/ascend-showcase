import Link from "next/link";

import RevelationX1Logo from "@/components/brand/RevelationX1Logo";

import { applicantLogin } from "./actions";

type ApplicantLoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function ApplicantLoginPage({
  searchParams,
}: ApplicantLoginPageProps) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <RevelationX1Logo />

          <Link
            href="/apply/lagos-2027"
            className="text-sm font-medium text-white/55 transition hover:text-white"
          >
            Lagos 2027
          </Link>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-82px)] max-w-7xl items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
            Applicant Account
          </div>

          <h1 className="mt-3 text-4xl font-black">Sign in</h1>

          <p className="mt-3 text-sm leading-6 text-white/50">
            Sign in to your REVELATIONX1 account to continue your application or
            view its status.
          </p>

          <form
            action={applicantLogin}
            className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6"
          >
            {params.error && (
              <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4 text-sm text-red-200">
                {params.error}
              </div>
            )}

            <label className="block">
              <span className="text-sm font-bold">Email address</span>

              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
              />
            </label>

            <label className="mt-5 block">
              <span className="text-sm font-bold">Password</span>

              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
              />
            </label>

            <div className="mt-4 text-right">
              <Link
                href="/account/forgot-password"
                className="text-xs font-semibold text-white/45 transition hover:text-[#c7ff2f]"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="mt-7 w-full rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90"
            >
              Sign In
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/45">
            Don't have an account?{" "}
            <Link
              href="/account/register"
              className="font-bold text-[#c7ff2f] transition hover:text-white"
            >
              Create account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
