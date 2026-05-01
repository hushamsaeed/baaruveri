import { db, schema } from "@/db";
import { getCouncilMembers } from "@/db/queries/council";
import { listIslands } from "@/db/queries/islands";
import { buildCsv, csvOptions, csvResponse } from "@/lib/csv";

export const dynamic = "force-dynamic";

const COLUMNS = [
  "id",
  "island_id",
  "island_slug",
  "name_en",
  "name_dv",
  "role_en",
  "role_dv",
  "party",
  "ward_en",
  "elected_at",
] as const;

export const OPTIONS = csvOptions;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const islandFilter = searchParams.get("island");

  const islands = await listIslands();
  const islandsBySlug = new Map(islands.map((i) => [i.id, i.slug] as const));

  let members;
  let filename = "baaruveri-council.csv";
  if (islandFilter) {
    const match = islands.find(
      (i) => i.slug === islandFilter || i.id === islandFilter
    );
    if (!match) {
      return new Response(`Unknown island: ${islandFilter}`, { status: 400 });
    }
    members = await getCouncilMembers(match.id);
    filename = `baaruveri-council-${match.slug}.csv`;
  } else {
    const rows = await db.select().from(schema.councilMembers);
    members = rows.map((r) => ({
      id: r.id,
      island_id: r.islandId,
      name_dv: r.nameDv,
      name_en: r.nameEn,
      role_en: r.roleEn,
      role_dv: r.roleDv,
      party: r.party,
      ward_en: r.wardEn ?? undefined,
      elected_at: r.electedAt,
    }));
  }

  const rows = members.map((m) => ({
    id: m.id,
    island_id: m.island_id,
    island_slug: islandsBySlug.get(m.island_id) ?? "",
    name_en: m.name_en,
    name_dv: m.name_dv,
    role_en: m.role_en,
    role_dv: m.role_dv,
    party: m.party,
    ward_en: m.ward_en ?? "",
    elected_at: m.elected_at,
  }));
  return csvResponse(buildCsv(COLUMNS, rows), filename);
}
