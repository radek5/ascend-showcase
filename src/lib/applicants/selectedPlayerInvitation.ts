import "server-only";

import { cookies } from "next/headers";

const COOKIE_NAME = "rx1_selected_player_invitation";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export async function storeSelectedPlayerInvitation(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function getSelectedPlayerInvitation() {
  const cookieStore = await cookies();

  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function clearSelectedPlayerInvitation() {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_NAME);
}
