"use client";

import Link from "next/link";
import { useState } from "react";
import { removeStaffUser, updateStaffRole } from "./actions";

type Props = {
  userId: string;
  role: "ADMIN" | "STAFF";
  active: boolean;
  isCurrentAdmin: boolean;
};

export default function StaffActionsMenu({
  userId,
  role,
  active,
  isCurrentAdmin,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="rounded-full border border-white/15 px-4 py-2 text-xs font-black uppercase text-white/70 hover:border-[#c7ff2f]/40 hover:text-white"
      >
        Actions ▾
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-white/15 bg-[#171717] p-2 shadow-xl">
          {active && (
            <>
              <Link
                href={`/staff/users/${userId}/edit`}
                className="block rounded-lg px-3 py-2 text-sm hover:bg-white/10"
              >
                Change Password
              </Link>

              <form action={updateStaffRole}>
                <input type="hidden" name="staffUserId" value={userId} />
                <input
                  type="hidden"
                  name="role"
                  value={role === "ADMIN" ? "STAFF" : "ADMIN"}
                />
                <button
                  type="submit"
                  className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10"
                >
                  {role === "ADMIN"
                    ? isCurrentAdmin
                      ? "Demote Myself"
                      : "Demote to Staff"
                    : "Promote to Admin"}
                </button>
              </form>

              {!isCurrentAdmin && (
                <form
                  action={removeStaffUser}
                  onSubmit={(event) => {
                    if (
                      !window.confirm(
                        "Remove this staff member? Their account will be deactivated.",
                      )
                    ) {
                      event.preventDefault();
                    }
                  }}
                >
                  <input type="hidden" name="staffUserId" value={userId} />
                  <button
                    type="submit"
                    className="mt-1 w-full rounded-lg border-t border-white/10 px-3 py-3 text-left text-sm text-red-300 hover:bg-red-500/10"
                  >
                    Remove User
                  </button>
                </form>
              )}
            </>
          )}

          {!active && (
            <div className="px-3 py-2 text-sm text-white/40">
              Account inactive
            </div>
          )}
        </div>
      )}
    </div>
  );
}
