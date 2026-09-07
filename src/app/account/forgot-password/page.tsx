import Link from "next/link";

import RevelationX1Logo from "@/components/brand/RevelationX1Logo";

import { requestApplicantPasswordReset } from "./actions";

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    sent?: string;
    email?: string;
  }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const params = await searchParams;
  const sent = params.sent === "1";

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

          <h1 className="mt-3 text-4xl font-black">Reset your password</h1>

          <p className="mt-3 text-sm leading-6 text-white/50">
            Enter the email address linked to your REVELATIONX1 applicant
            account.
          </p>

          {sent ? (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <div className="rounded-xl border border-[#c7ff2f]/20 bg-[#c7ff2f]/[0.06] p-4 text-sm leading-6 text-[#c7ff2f]">
                If an account exists for that email address, a password reset
                link has been sent.
              </div>

              <p className="mt-5 text-sm leading-6 text-white/45">
                Check your inbox and spam or junk folder. The reset link expires
                after 60 minutes.
              </p>

              <Link
                href="/account/login"
                className="mt-7 inline-flex w-full justify-center rounded-full border border-white/15 px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:border-[#c7ff2f]/50 hover:text-[#c7ff2f]"
              >
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form
              action={requestApplicantPasswordReset}
              className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6"
            >
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

              <button
                type="submit"
                className="mt-7 w-full rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90"
              >
                Send Reset Link
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
