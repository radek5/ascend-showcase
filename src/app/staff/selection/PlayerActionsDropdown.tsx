"use client";

import { useState } from "react";

import {
  editPreSelectedPlayer,
  movePreSelectedPlayerToStandby,
  removePreSelectedPlayer,
} from "./actions";

type Props = {
  playerId: string;
  playerName: string;
  fullName: string;
  reportedAge: number | null;
  position: string;
  whatsappNumber: string | null;
};

export default function PlayerActionsDropdown({
  playerId,
  playerName,
  fullName,
  reportedAge,
  position,
  whatsappNumber,
}: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:border-[#c7ff2f]/60"
      >
        Actions ▾
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-48 rounded-xl border border-white/15 bg-[#171717] p-1 shadow-xl">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setEditing(true);
            }}
            className="block w-full rounded-lg px-3 py-2.5 text-left text-xs font-bold text-white hover:bg-white/10"
          >
            Edit
          </button>

          <form action={movePreSelectedPlayerToStandby}>
            <input type="hidden" name="playerId" value={playerId} />
            <button
              type="submit"
              className="block w-full rounded-lg px-3 py-2.5 text-left text-xs font-bold text-white hover:bg-white/10"
            >
              Move to Standby
            </button>
          </form>

          <form
            action={removePreSelectedPlayer}
            onSubmit={(event) => {
              if (
                !window.confirm(
                  `Remove ${playerName} from the pre-selected list?`,
                )
              ) {
                event.preventDefault();
              }
            }}
          >
            <input type="hidden" name="playerId" value={playerId} />
            <button
              type="submit"
              className="block w-full rounded-lg px-3 py-2.5 text-left text-xs font-bold text-red-400 hover:bg-white/10"
            >
              Remove Player
            </button>
          </form>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#171717] p-6">
            <h2 className="mb-5 text-lg font-black text-white">Edit Player</h2>

            <form action={editPreSelectedPlayer} className="space-y-4">
              <input type="hidden" name="playerId" value={playerId} />

              <label className="block text-xs font-bold text-white/70">
                Full Name
                <input
                  name="fullName"
                  defaultValue={fullName}
                  required
                  maxLength={150}
                  className="mt-2 w-full rounded-lg border border-white/20 bg-black p-3 text-white"
                />
              </label>

              <label className="block text-xs font-bold text-white/70">
                Age
                <input
                  name="reportedAge"
                  type="number"
                  min={1}
                  max={100}
                  defaultValue={reportedAge ?? ""}
                  className="mt-2 w-full rounded-lg border border-white/20 bg-black p-3 text-white"
                />
              </label>

              <label className="block text-xs font-bold text-white/70">
                Position
                <input
                  name="position"
                  defaultValue={position}
                  maxLength={100}
                  className="mt-2 w-full rounded-lg border border-white/20 bg-black p-3 text-white"
                />
              </label>

              <label className="block text-xs font-bold text-white/70">
                WhatsApp Number
                <input
                  name="whatsappNumber"
                  defaultValue={whatsappNumber ?? ""}
                  maxLength={25}
                  className="mt-2 w-full rounded-lg border border-white/20 bg-black p-3 text-white"
                />
              </label>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-lg border border-white/20 px-5 py-2 text-sm text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-[#c7ff2f] px-5 py-2 text-sm font-black text-black"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
