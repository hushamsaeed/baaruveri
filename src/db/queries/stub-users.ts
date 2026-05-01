import { eq } from "drizzle-orm";
import { db } from "../index";
import { stubUsers as stubUsersTable } from "../schema";

export interface StubUser {
  id: string;
  name_dv: string;
  name_en: string;
  nid: string;
  island_slug: string;
  verified_at: string;
}

type Row = typeof stubUsersTable.$inferSelect;

function rowToUser(r: Row): StubUser {
  return {
    id: r.id,
    name_dv: r.nameDv,
    name_en: r.nameEn,
    nid: r.nid,
    island_slug: r.islandSlug,
    verified_at: r.verifiedAt,
  };
}

export async function listStubUsers(): Promise<StubUser[]> {
  const rows = await db.select().from(stubUsersTable);
  return rows.map(rowToUser);
}

export async function getStubUserById(id: string): Promise<StubUser | undefined> {
  const rows = await db
    .select()
    .from(stubUsersTable)
    .where(eq(stubUsersTable.id, id))
    .limit(1);
  return rows[0] ? rowToUser(rows[0]) : undefined;
}
