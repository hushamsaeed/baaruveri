import { eq } from "drizzle-orm";
import { db } from "../index";
import { councilMembers as councilTable } from "../schema";
import type { CouncilMember } from "@/lib/types";

type Row = typeof councilTable.$inferSelect;

function rowToMember(r: Row): CouncilMember {
  return {
    id: r.id,
    island_id: r.islandId,
    name_dv: r.nameDv,
    name_en: r.nameEn,
    role_en: r.roleEn,
    role_dv: r.roleDv,
    party: r.party,
    ward_en: r.wardEn ?? undefined,
    elected_at: r.electedAt,
  };
}

export async function getCouncilMembers(islandId: string): Promise<CouncilMember[]> {
  const rows = await db
    .select()
    .from(councilTable)
    .where(eq(councilTable.islandId, islandId));
  return rows.map(rowToMember);
}
