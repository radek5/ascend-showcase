import Link from "next/link";

import { requireStaffUser } from "@/lib/staff/auth";
import { changeMyPassword } from "./actions";

const errors: Record<string, string> = {
  "missing-fields": "Please complete all password fields.",
  "password-length": "New password must be at least 12 characters.",
  "password-mismatch": "New passwords do not match.",
  "invalid-current": "Your current password is incorrect.",
};

export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireStaffUser();
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[#090909] px-6 py-12 text-white">
      <div className="mx-auto max-w-xl">
        <Link
          href="/staff/dashboard"
          className="text-sm font-bold text-white/60 transition hover:text-white"
        >
          ← Back Office
        </Link>

        <div className="mt-10 text-xs font-black uppercase tracking-[0.2em] text-[#c7ff2f]">
          Account Security
        </div>

        <h1 className="mt-3 text-4xl font-black">Change My Password</h1>

        <p className="mt-3 text-white/50">
          Update your REVELATIONX1 Back Office password.
        </p>

        {params.error && errors[params.error] && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200"
          >
            {errors[params.error]}
          </div>
        )}

        <form
          action={changeMyPassword}
          className="mt-8 space-y-6 rounded-2xl border border-white/10 bg-white/[0.025] p-6"
        >
          <label className="block text-sm font-bold">
            Current Password
            <input
              type="password"
              name="currentPassword"
              autoComplete="current-password"
              required
              className="mt-2 w-full rounded-xl border border-white/15 bg-black p-3 text-white"
            />
          </label>

          <label className="block text-sm font-bold">
            New Password
            <input
              type="password"
              name="newPassword"
              autoComplete="new-password"
              minLength={12}
              required
              className="mt-2 w-full rounded-xl border border-white/15 bg-black p-3 text-white"
            />
          </label>

          <label className="block text-sm font-bold">
            Confirm New Password
            <input
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              minLength={12}
              required
              className="mt-2 w-full rounded-xl border border-white/15 bg-black p-3 text-white"
            />
          </label>

          <button
            type="submit"
            className="rounded-full bg-[#c7ff2f] px-6 py-3 text-xs font-black uppercase text-black"
          >
            Change Password
          </button>
        </form>
      </div>
    </main>
  );
}
