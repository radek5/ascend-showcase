import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "ascend_selector_session";

function getSecret() {
  const secret =
    process.env.SELECTOR_SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "SELECTOR_SESSION_SECRET is not configured."
    );
  }

  return new TextEncoder().encode(secret);
}

export type SelectorSessionPayload = {
  selectorId: string;
};

export async function createSelectorSession(
  payload: SelectorSessionPayload
) {
  const expiresAt = new Date(
    Date.now() + 12 * 60 * 60 * 1000
  );

  const token = await new SignJWT({
    selectorId: payload.selectorId,
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
    }
  );
}

export async function getSelectorSession():
  Promise<SelectorSessionPayload | null> {
  const cookieStore = await cookies();

  const token =
    cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } =
      await jwtVerify(
        token,
        getSecret()
      );

    const selectorId =
      typeof payload.selectorId === "string"
        ? payload.selectorId
        : null;

    if (!selectorId) {
      return null;
    }

    return {
      selectorId,
    };
  } catch {
    return null;
  }
}

export async function deleteSelectorSession() {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_NAME);
}
