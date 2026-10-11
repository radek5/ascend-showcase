import "server-only";

import { createHmac } from "node:crypto";

function getNinHmacSecret() {
  const secret = process.env.SHOWCASE_NIN_HMAC_SECRET?.trim();

  if (!secret) {
    throw new Error("SHOWCASE_NIN_HMAC_SECRET is not configured");
  }

  return secret;
}

export function normalizeNin(value: string) {
  return value.replace(/[\s-]/g, "");
}

export function validateNin(value: string) {
  const normalized = normalizeNin(value);

  if (!/^\d{11}$/.test(normalized)) {
    throw new Error("NIN must contain exactly 11 digits");
  }

  return normalized;
}

export function hashNin(value: string) {
  const normalized = validateNin(value);

  return createHmac("sha256", getNinHmacSecret())
    .update(normalized, "utf8")
    .digest("hex");
}

export function getNinLast4(value: string) {
  return validateNin(value).slice(-4);
}

export function maskNinLast4(last4: string) {
  return `•••••••${last4}`;
}
