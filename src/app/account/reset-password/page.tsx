import Link from "next/link";

import RevelationX1Logo from "@/components/brand/RevelationX1Logo";

import { resetApplicantPassword } from "./actions";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
    error?: string;
    invalid?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;

  const token = params.token || "";
  const invalid = params.invalid === "1" || !token;

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <RevelationX1Logo />

          <Link
            href="/account/login"
            className="text-sm font-medium text-white/55 transition hover:text-white"
          >
            Sign In
          </Link>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-82px)] max-w-7xl items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
            Applicant Account
          </div>

          {invalid ? (
            <>
              <h1 className="mt-3 text-4xl font-black">
                Reset link unavailable
              </h1>

              <p className="mt-4 text-sm leading-7 text-white/50">
                This password reset link is invalid, expired or has already been
                used.
              </p>

              <Link
                href="/account/forgot-password"
                className="mt-8 inline-flex w-full justify-center rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90"
              >
                Request New Reset Link
              </Link>
            </>
          ) : (
            <>
              <h1 className="mt-3 text-4xl font-black">
                Choose a new password
              </h1>

              <p className="mt-3 text-sm leading-6 text-white/50">
                Set a new password for your REVELATIONX1 applicant account.
              </p>

              <form
                action={resetApplicantPassword}
                className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6"
              >
                <input type="hidden" name="token" value={token} />

                {params.error && (
                  <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4 text-sm leading-6 text-red-200">
                    {params.error}
                  </div>
                )}

                <label className="block">
                  <span className="text-sm font-bold">New password</span>

                  <input
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={10}
                    required
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
                  />

                  <span className="mt-2 block text-xs leading-5 text-white/35">
                    At least 10 characters, including an uppercase letter,
                    lowercase letter and number.
                  </span>
                </label>

                <label className="mt-5 block">
                  <span className="text-sm font-bold">
                    Confirm new password
                  </span>

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
                  Set New Password
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
