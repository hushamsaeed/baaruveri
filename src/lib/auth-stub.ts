import { cookies } from "next/headers";
import { getStubUserById, type StubUser } from "@/db/queries/stub-users";

// v0 eFaas stub. Replaces with real Auth.js v5 OIDC adapter later
// (claim shape `{ sub, name_dv, name_en, nid, island_id, verified_at }` is
// designed to match what Maldives eFaas would return, so the swap is
// adapter-only, not UI rework). The cookie holds the stub-user id; the
// canonical record lives in the stub_users table.

export type { StubUser } from "@/db/queries/stub-users";

const COOKIE_NAME = "efaas_stub_user";

export async function getCurrentStubUser(): Promise<StubUser | null> {
  const c = await cookies();
  const id = c.get(COOKIE_NAME)?.value;
  if (!id) return null;
  return (await getStubUserById(id)) ?? null;
}

export async function setStubUser(userId: string): Promise<void> {
  // Validate against the DB so an attacker can't set the cookie to an
  // arbitrary string and pretend to be someone — the runtime lookup would
  // fail anyway, but failing fast at set-time is a friendlier signal.
  const user = await getStubUserById(userId);
  if (!user) throw new Error(`Unknown stub user: ${userId}`);
  const c = await cookies();
  c.set(COOKIE_NAME, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearStubUser(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}
