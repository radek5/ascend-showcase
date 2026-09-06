import Link from "next/link";

import RevelationX1Logo from "@/components/brand/RevelationX1Logo";

import { registerApplicant } from "./actions";

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
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

      <section className="mx-auto flex max-w-7xl justify-center px-6 py-16 lg:px-8 lg:py-24">
        <div className="w-full max-w-lg">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
            Applicant Account
          </div>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Create your account
          </h1>

          <p className="mt-4 text-sm leading-7 text-white/55">
            Create your secure REVELATIONX1 account to start an application,
            save your progress and return later to continue.
          </p>

          <form
            action={registerApplicant}
            className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:p-8"
          >
            {params.error && (
              <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4 text-sm leading-6 text-red-200">
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
                autoComplete="new-password"
                minLength={10}
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
              />

              <span className="mt-2 block text-xs leading-5 text-white/35">
                At least 10 characters, including an uppercase letter, lowercase
                letter and number.
              </span>
            </label>

            <label className="mt-5 block">
              <span className="text-sm font-bold">Confirm password</span>

              <input
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={10}
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
              />
            </label>

            <button
              type="submit"
              className="mt-7 w-full rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90"
            >
              Create Account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/45">
            Already have an account?{" "}
            <Link
              href="/account/login"
              className="font-bold text-[#c7ff2f] transition hover:text-white"
            >
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center text-xs leading-5 text-white/30">
            You will need to verify your email address before starting or
            continuing an application.
          </p>
        </div>
      </section>
    </main>
  );
}
