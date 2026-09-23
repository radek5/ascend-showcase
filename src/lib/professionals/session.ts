import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME =
  "revelationx1_professional_registration_session";

function getSecret() {
  const secret =
    process.env.PROFESSIONAL_SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "PROFESSIONAL_SESSION_SECRET is not configured.",
    );
  }

  return new TextEncoder().encode(secret);
}

export type ProfessionalRegistrationSessionPayload = {
  professionalRegistrationId: string;
};

export async function createProfessionalRegistrationSession(
  payload: ProfessionalRegistrationSessionPayload,
) {
  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  );

  const token = await new SignJWT({
    professionalRegistrationId:
      payload.professionalRegistrationId,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getProfessionalRegistrationSession():
  Promise<ProfessionalRegistrationSessionPayload | null> {
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

    const professionalRegistrationId =
      typeof payload.professionalRegistrationId ===
      "string"
        ? payload.professionalRegistrationId
        : null;

    if (!professionalRegistrationId) {
      return null;
    }

    return {
      professionalRegistrationId,
    };
  } catch {
    return null;
  }
}

export async function deleteProfessionalRegistrationSession() {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_NAME);
}
