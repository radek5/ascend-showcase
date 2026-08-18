import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "ascend_staff_session";

function getSecret() {
  const secret = process.env.STAFF_SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "STAFF_SESSION_SECRET is not configured.",
    );
  }

  return new TextEncoder().encode(secret);
}

export type StaffSessionPayload = {
  staffUserId: string;
  role: "ADMIN" | "STAFF";
};

export async function createStaffSession(
  payload: StaffSessionPayload,
) {
  const expiresAt = new Date(
    Date.now() + 12 * 60 * 60 * 1000,
  );

  const token = await new SignJWT({
    staffUserId: payload.staffUserId,
    role: payload.role,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(getSecret());

  const cookieStore = await cookies();

  cookieStore.set(
    COOKIE_NAME,
    token,
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    },
  );
}

export async function getStaffSession():
  Promise<StaffSessionPayload | null> {
  const cookieStore = await cookies();

  const token =
    cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      getSecret(),
    );

    const staffUserId =
      typeof payload.staffUserId === "string"
        ? payload.staffUserId
        : null;

    const role =
      payload.role === "ADMIN" ||
      payload.role === "STAFF"
        ? payload.role
        : null;

    if (!staffUserId || !role) {
      return null;
    }

    return {
      staffUserId,
      role,
    };
  } catch {
    return null;
  }
}

export async function deleteStaffSession() {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_NAME);
}
