import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireStaffAdmin } from "@/lib/staff/auth";
import { updateStaffRole } from "./actions";

export default async function StaffUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;
  const currentAdmin = await requireStaffAdmin();

  const staffUsers = await prisma.staffUser.findMany({
    orderBy: [
      {
        active: "desc",
      },
      {
        name: "asc",
      },
    ],
  });

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c7ff2f]">
              Administration
            </div>

            <h1 className="mt-3 text-4xl font-black">
              Staff Management
            </h1>

            <p className="mt-3 text-white/50">
              Create and manage authorised REVELATIONX1 Back Office users.
            </p>
          </div>

          <Link
            href="/staff/users/new"
            className="rounded-full bg-[#c7ff2f] px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-black"
          >
            Add Staff User
          </Link>
        </div>

        {params.success === "promoted" && (
          <div className="mt-8 rounded-2xl border border-[#c7ff2f]/25 bg-[#c7ff2f]/[0.06] px-5 py-4">
            <div className="text-sm font-black text-[#c7ff2f]">
              Staff member promoted to ADMIN.
            </div>
          </div>
        )}

        {params.success === "demoted" && (
          <div className="mt-8 rounded-2xl border border-[#c7ff2f]/25 bg-[#c7ff2f]/[0.06] px-5 py-4">
            <div className="text-sm font-black text-[#c7ff2f]">
              Administrator demoted to STAFF.
            </div>
          </div>
        )}

        {params.error === "last-admin" && (
          <div className="mt-8 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] px-5 py-4">
            <div className="text-sm font-black text-amber-200">
              Role change blocked
            </div>

            <p className="mt-1 text-sm text-amber-100/60">
              The last active administrator cannot be demoted. Promote another
              staff member to ADMIN first.
            </p>
          </div>
        )}

        <div className="mt-10 overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-[1.4fr_1.5fr_0.7fr_0.7fr_1fr_1fr] gap-4 border-b border-white/10 bg-white/[0.03] px-6 py-4 text-xs font-black uppercase tracking-[0.1em] text-white/35">
            <div>Name</div>
            <div>Email</div>
            <div>Role</div>
            <div>Status</div>
            <div>Last Login</div>
            <div>Actions</div>
          </div>

          {staffUsers.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-[1.4fr_1.5fr_0.7fr_0.7fr_1fr_1fr] gap-4 border-b border-white/5 px-6 py-5 text-sm last:border-b-0"
            >
              <div className="font-bold">
                {user.name}
              </div>

              <div className="text-white/60">
                {user.email}
              </div>

              <div>
                <span className="rounded-full border border-[#c7ff2f]/20 bg-[#c7ff2f]/[0.05] px-3 py-1 text-xs font-black text-[#c7ff2f]">
                  {user.role}
                </span>
              </div>

              <div>
                {user.active ? (
                  <span className="text-[#c7ff2f]">
                    Active
                  </span>
                ) : (
                  <span className="text-red-300">
                    Inactive
                  </span>
                )}
              </div>

              <div className="text-white/45">
                {user.lastLoginAt
                  ? new Intl.DateTimeFormat("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(user.lastLoginAt)
                  : "Never"}
              </div>

              <div>
                {user.active ? (
                  <form action={updateStaffRole}>
                    <input
                      type="hidden"
                      name="staffUserId"
                      value={user.id}
                    />

                    <input
                      type="hidden"
                      name="role"
                      value={
                        user.role === "ADMIN"
                          ? "STAFF"
                          : "ADMIN"
                      }
                    />

                    <button
                      type="submit"
                      className="rounded-full border border-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.06em] text-white/60 transition hover:border-[#c7ff2f]/30 hover:text-white"
                    >
                      {user.role === "ADMIN"
                        ? user.id === currentAdmin.id
                          ? "Demote Myself"
                          : "Demote to Staff"
                        : "Promote to Admin"}
                    </button>
                  </form>
                ) : (
                  <span className="text-xs text-white/25">
                    Unavailable
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
