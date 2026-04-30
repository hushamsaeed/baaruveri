import { cookies } from "next/headers";

// v0 eFaas stub. Replaces with real Auth.js v5 OIDC adapter later
// (claim shape `{ sub, name_dv, name_en, nid, island_id, verified_at }` is
// designed to match what Maldives eFaas would return, so the swap is
// adapter-only, not UI rework).

export interface StubUser {
  id: string;
  name_dv: string;
  name_en: string;
  nid: string;
  island_slug: string;
  verified_at: string;
}

export const STUB_USERS: StubUser[] = [
  {
    id: "u-naseem",
    name_dv: "މުޙައްމަދު ނަސީމް",
    name_en: "Mohamed Naseem",
    nid: "A012345",
    island_slug: "maafaru",
    verified_at: "2026-01-15",
  },
  {
    id: "u-hashim",
    name_dv: "ޢާއިޝަތު ހާޝިމް",
    name_en: "Aishath Hashim",
    nid: "A023456",
    island_slug: "hulhumale",
    verified_at: "2025-11-22",
  },
  {
    id: "u-faruhad",
    name_dv: "އަޙްމަދު ފަރުހާދު",
    name_en: "Ahmed Faruhad",
    nid: "A034567",
    island_slug: "male",
    verified_at: "2025-08-30",
  },
  {
    id: "u-reema",
    name_dv: "ފާޠިމަތު ރީމާ",
    name_en: "Fathmath Reema",
    nid: "A045678",
    island_slug: "addu-city",
    verified_at: "2026-02-14",
  },
];

const COOKIE_NAME = "efaas_stub_user";

export async function getCurrentStubUser(): Promise<StubUser | null> {
  const c = await cookies();
  const id = c.get(COOKIE_NAME)?.value;
  if (!id) return null;
  return STUB_USERS.find((u) => u.id === id) ?? null;
}

export async function setStubUser(userId: string): Promise<void> {
  const user = STUB_USERS.find((u) => u.id === userId);
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
