import Link from "next/link";

import RevelationX1Logo from "@/components/brand/RevelationX1Logo";
import { resendApplicantVerificationEmail } from "./actions";

type CheckEmailPageProps = {
  searchParams: Promise<{
    email?: string;
    delivery?: string;
    verification?: string;
    resent?: string;
  }>;
};

export default async function CheckEmailPage({
  searchParams,
}: CheckEmailPageProps) {
  const params = await searchParams;

  const deliveryFailed = params.delivery === "failed";
  const verificationInvalid = params.verification === "invalid";

  const verificationRequired = params.verification === "required";

  const resent = params.resent === "1";

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
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-7 sm:p-9">
            {verificationInvalid ? (
              <>
                <div className="text-xs font-black uppercase tracking-[0.22em] text-amber-300">
                  Verification Required
                </div>

                <h1 className="mt-3 text-3xl font-black">
                  Verification link unavailable
                </h1>

                <p className="mt-4 text-sm leading-7 text-white/55">
                  This verification link is invalid, expired or has already been
                  used.
                </p>

                <p className="mt-4 text-sm leading-7 text-white/55">
                  Sign in to your account to continue or request a new
                  verification email.
                </p>

                <Link
                  href="/account/login"
                  className="mt-7 inline-flex w-full justify-center rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90"
                >
                  Sign In
                </Link>
              </>
            ) : deliveryFailed ? (
              <>
                <div className="text-xs font-black uppercase tracking-[0.22em] text-amber-300">
                  Account Created
                </div>

                <h1 className="mt-3 text-3xl font-black">
                  We could not send the email
                </h1>

                <p className="mt-4 text-sm leading-7 text-white/55">
                  Your account has been created, but we could not deliver the
                  verification email.
                </p>

                <p className="mt-4 text-sm leading-7 text-white/55">
                  Your account is safe. You will be able to request another
                  verification email without creating a new account.
                </p>

                <Link
                  href="/account/login"
                  className="mt-7 inline-flex w-full justify-center rounded-full border border-white/15 px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:border-white/30"
                >
                  Go to Sign In
                </Link>
              </>
            ) : (
              <>
                <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
                  {verificationRequired
                    ? "Email Verification"
                    : "Account Created"}
                </div>

                <h1 className="mt-3 text-3xl font-black">
                  {verificationRequired
                    ? "Verify your email"
                    : "Check your email"}
                </h1>

                {resent && (
                  <div className="mt-5 rounded-xl border border-[#c7ff2f]/20 bg-[#c7ff2f]/[0.06] p-4 text-sm leading-6 text-[#c7ff2f]">
                    A new verification email has been sent.
                  </div>
                )}

                <p className="mt-4 text-sm leading-7 text-white/55">
                  We sent a verification link
                  {params.email ? (
                    <>
                      {" "}
                      to{" "}
                      <span className="font-bold text-white">
                        {params.email}
                      </span>
                    </>
                  ) : (
                    ""
                  )}
                  .
                </p>

                <p className="mt-4 text-sm leading-7 text-white/55">
                  Open the email and select{" "}
                  <span className="font-bold text-white">Verify Email</span> to
                  activate your REVELATIONX1 applicant account.
                </p>

                <div className="mt-7 rounded-xl border border-white/10 bg-black/20 p-4 text-xs leading-6 text-white/40">
                  The verification link expires after 24 hours. If you cannot
                  see the email, check your spam or junk folder.
                </div>

                {verificationRequired && (
                  <form
                    action={resendApplicantVerificationEmail}
                    className="mt-5"
                  >
                    <button
                      type="submit"
                      className="w-full rounded-full border border-white/15 px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:border-[#c7ff2f]/50 hover:text-[#c7ff2f]"
                    >
                      Send New Verification Email
                    </button>
                  </form>
                )}
              </>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-white/40">
            Already verified?{" "}
            <Link
              href="/account/login"
              className="font-bold text-[#c7ff2f] transition hover:text-white"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
