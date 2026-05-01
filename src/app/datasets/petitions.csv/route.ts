import { listPetitions, getPetitionsForIsland } from "@/db/queries/petitions";
import { listIslands } from "@/db/queries/islands";
import { getSignatureCount } from "@/db/queries/signatures";
import { buildCsv, csvOptions, csvResponse } from "@/lib/csv";

export const dynamic = "force-dynamic";

const COLUMNS = [
  "id",
  "scope",
  "island_id",
  "island_slug",
  "title_en",
  "title_dv",
  "summary_en",
  "threshold",
  "signatures_baseline",
  "signatures_session",
  "signatures_total",
  "closes_at",
  "started_by_en",
  "started_by_dv",
  "started_at",
  "efaas_verified_pct",
] as const;

export const OPTIONS = csvOptions;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const islandFilter = searchParams.get("island");

  const islands = await listIslands();
  const islandsBySlug = new Map(islands.map((i) => [i.id, i.slug] as const));

  let petitions;
  let filename = "baaruveri-petitions.csv";
  if (islandFilter) {
    const match = islands.find(
      (i) => i.slug === islandFilter || i.id === islandFilter
    );
    if (!match) {
      return new Response(`Unknown island: ${islandFilter}`, { status: 400 });
    }
    petitions = await getPetitionsForIsland(match.id);
    filename = `baaruveri-petitions-${match.slug}.csv`;
  } else {
    petitions = await listPetitions();
  }

  const rows = await Promise.all(
    petitions.map(async (p) => {
      const session = await getSignatureCount(p.id);
      return {
        id: p.id,
        scope: p.scope,
        island_id: p.island_id ?? "",
        island_slug: p.island_id ? islandsBySlug.get(p.island_id) ?? "" : "",
        title_en: p.title_en,
        title_dv: p.title_dv,
        summary_en: p.summary_en,
        threshold: p.threshold,
        signatures_baseline: p.signatures,
        signatures_session: session,
        signatures_total: p.signatures + session,
        closes_at: p.closes_at,
        started_by_en: p.started_by_en,
        started_by_dv: p.started_by_dv,
        started_at: p.started_at,
        efaas_verified_pct: p.efaas_verified_pct,
      };
    })
  );
  return csvResponse(buildCsv(COLUMNS, rows), filename);
}
