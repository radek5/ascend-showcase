import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireStaffAdmin } from "@/lib/staff/auth";

export default async function StaffUsersPage() {
  await requireStaffAdmin();

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
              Create and manage authorised ASCEND Back Office users.
            </p>
          </div>

          <Link
            href="/staff/users/new"
            className="rounded-full bg-[#c7ff2f] px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-black"
          >
            Add Staff User
          </Link>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-[1.5fr_1.5fr_0.8fr_0.8fr_1fr] gap-4 border-b border-white/10 bg-white/[0.03] px-6 py-4 text-xs font-black uppercase tracking-[0.1em] text-white/35">
            <div>Name</div>
            <div>Email</div>
            <div>Role</div>
            <div>Status</div>
            <div>Last Login</div>
          </div>

          {staffUsers.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-[1.5fr_1.5fr_0.8fr_0.8fr_1fr] gap-4 border-b border-white/5 px-6 py-5 text-sm last:border-b-0"
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
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
