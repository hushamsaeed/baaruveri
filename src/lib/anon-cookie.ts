import { cookies } from "next/headers";
import { randomBytes } from "crypto";

// Long-lived anon cookie used ONLY to derive a per-thread pseudonym
// (see src/lib/pseudonym.ts) for unauthed comment authors. Not linked to
// any identity, never leaves the server, no IP attached. The cookie value
// is 32 random bytes hex-encoded — unguessable, no PII.
const COOKIE_NAME = "baaruveri_anon";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Read the existing anon ID, or null if not set yet. */
export async function getAnonId(): Promise<string | null> {
  const c = await cookies();
  return c.get(COOKIE_NAME)?.value ?? null;
}

/** Read the existing anon ID or set a new one. Returns the active ID. */
export async function ensureAnonId(): Promise<string> {
  const c = await cookies();
  const existing = c.get(COOKIE_NAME)?.value;
  if (existing) return existing;
  const id = randomBytes(16).toString("hex");
  c.set(COOKIE_NAME, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });
  return id;
}
