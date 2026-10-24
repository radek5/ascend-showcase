import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireStaffAdmin } from "@/lib/staff/auth";
import { changeStaffPassword } from "../../actions";

export default async function EditStaffUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaffAdmin();

  const { id } = await params;

  const user = await prisma.staffUser.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      active: true,
    },
  });

  if (!user) notFound();

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <section className="mx-auto max-w-2xl px-6 py-12">
        <Link
          href="/staff/users"
          className="text-sm text-white/50 hover:text-white"
        >
          ← Back to Staff Management
        </Link>

        <h1 className="mt-8 text-4xl font-black">Change Staff Password</h1>

        <p className="mt-3 text-white/50">
          Change the password for this REVELATIONX1 Back Office account.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="font-bold">{user.name}</div>
          <div className="mt-1 text-sm text-white/50">{user.email}</div>
        </div>

        {user.active ? (
          <form action={changeStaffPassword} className="mt-8 space-y-6">
            <input type="hidden" name="staffUserId" value={user.id} />

            <div>
              <label htmlFor="password" className="block text-sm font-bold">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={12}
                autoComplete="new-password"
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-bold"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={12}
                autoComplete="new-password"
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white"
              />
            </div>

            <p className="text-xs text-white/40">
              Passwords must contain at least 12 characters.
            </p>

            <button
              type="submit"
              className="rounded-full bg-[#c7ff2f] px-6 py-3 text-xs font-black uppercase text-black"
            >
              Save New Password
            </button>
          </form>
        ) : (
          <p className="mt-8 text-sm text-red-300">
            Password changes are unavailable for inactive accounts.
          </p>
        )}
      </section>
    </main>
  );
}
