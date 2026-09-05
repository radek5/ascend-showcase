import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "revelationx1_applicant_session";

function getSecret() {
  const secret = process.env.APPLICANT_SESSION_SECRET;

  if (!secret) {
    throw new Error("APPLICANT_SESSION_SECRET is not configured.");
  }

  return new TextEncoder().encode(secret);
}

export type ApplicantSessionPayload = {
  applicantUserId: string;
};

export async function createApplicantSession(payload: ApplicantSessionPayload) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const token = await new SignJWT({
    applicantUserId: payload.applicantUserId,
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

export async function getApplicantSession(): Promise<ApplicantSessionPayload | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());

    const applicantUserId =
      typeof payload.applicantUserId === "string"
        ? payload.applicantUserId
        : null;

    if (!applicantUserId) {
      return null;
    }

    return {
      applicantUserId,
    };
  } catch {
    return null;
  }
}

export async function deleteApplicantSession() {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_NAME);
}
