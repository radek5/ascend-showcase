import Link from "next/link";

import { requireStaffAdmin } from "@/lib/staff/auth";
import { createStaffUser } from "./actions";

export default async function NewStaffUserPage() {
  await requireStaffAdmin();

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <section className="mx-auto max-w-3xl px-6 py-12 lg:px-8">
        <Link
          href="/staff/users"
          className="text-sm text-white/45 transition hover:text-white"
        >
          ← Back to Staff Management
        </Link>

        <div className="mt-8">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
            Administration
          </div>

          <h1 className="mt-3 text-4xl font-black">
            Create Staff User
          </h1>

          <p className="mt-3 text-white/50">
            Create an authorised ASCEND Back Office account.
          </p>
        </div>

        <form
          action={createStaffUser}
          className="mt-10 space-y-6 rounded-2xl border border-white/10 bg-white/[0.025] p-6"
        >
          <label className="block">
            <span className="text-sm font-bold">
              Full name
            </span>

            <input
              name="name"
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-4 outline-none focus:border-[#c7ff2f]/60"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold">
              Email
            </span>

            <input
              name="email"
              type="email"
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-4 outline-none focus:border-[#c7ff2f]/60"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold">
              Temporary password
            </span>

            <input
              name="password"
              type="password"
              minLength={12}
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-4 outline-none focus:border-[#c7ff2f]/60"
            />

            <div className="mt-2 text-xs text-white/35">
              Minimum 12 characters.
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-bold">
              Role
            </span>

            <select
              name="role"
              defaultValue="STAFF"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-4 outline-none focus:border-[#c7ff2f]/60"
            >
              <option value="STAFF">
                Staff
              </option>

              <option value="ADMIN">
                Admin
              </option>
            </select>
          </label>

          <button
            type="submit"
            className="rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black"
          >
            Create Staff User
          </button>
        </form>
      </section>
    </main>
  );
}
