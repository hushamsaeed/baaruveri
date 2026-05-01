import { eq, or } from "drizzle-orm";
import { db } from "../index";
import { petitions as petitionsTable } from "../schema";
import type { Petition } from "@/lib/types";

type Row = typeof petitionsTable.$inferSelect;

function rowToPetition(r: Row): Petition {
  return {
    id: r.id,
    title_dv: r.titleDv,
    title_en: r.titleEn,
    summary_en: r.summaryEn,
    scope: r.scope,
    island_id: r.islandId,
    threshold: r.threshold,
    signatures: r.signatures,
    closes_at: r.closesAt,
    started_by_dv: r.startedByDv,
    started_by_en: r.startedByEn,
    started_at: r.startedAt,
    efaas_verified_pct: r.efaasVerifiedPct,
  };
}

export async function listPetitions(): Promise<Petition[]> {
  const rows = await db.select().from(petitionsTable);
  return rows.map(rowToPetition);
}

export async function getPetition(id: string): Promise<Petition | undefined> {
  const rows = await db
    .select()
    .from(petitionsTable)
    .where(eq(petitionsTable.id, id))
    .limit(1);
  return rows[0] ? rowToPetition(rows[0]) : undefined;
}

export async function getPetitionsForIsland(islandId: string): Promise<Petition[]> {
  // Island-scoped petitions OR national-scope petitions (which surface on every island).
  const rows = await db
    .select()
    .from(petitionsTable)
    .where(or(eq(petitionsTable.islandId, islandId), eq(petitionsTable.scope, "national")));
  return rows.map(rowToPetition);
}
