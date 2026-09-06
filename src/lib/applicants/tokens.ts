import "server-only";

import { createHash, randomBytes } from "node:crypto";

export function createSecureToken() {
  return randomBytes(32).toString("hex");
}

export function hashSecureToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
