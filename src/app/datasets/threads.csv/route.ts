import { listThreads, getThreadsForIsland } from "@/db/queries/threads";
import { listIslands } from "@/db/queries/islands";
import { buildCsv, csvOptions, csvResponse } from "@/lib/csv";

export const dynamic = "force-dynamic";

const COLUMNS = [
  "id",
  "issue",
  "island_id",
  "island_slug",
  "title_en",
  "title_dv",
  "summary_en",
  "started_by_en",
  "started_by_dv",
  "started_at",
  "reply_count",
  "claim_count",
  "vote_count",
] as const;

export const OPTIONS = csvOptions;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const islandFilter = searchParams.get("island");

  const islands = await listIslands();
  const islandsBySlug = new Map(islands.map((i) => [i.id, i.slug] as const));

  let threads;
  let filename = "baaruveri-threads.csv";
  if (islandFilter) {
    const match = islands.find(
      (i) => i.slug === islandFilter || i.id === islandFilter
    );
    if (!match) {
      return new Response(`Unknown island: ${islandFilter}`, { status: 400 });
    }
    threads = await getThreadsForIsland(match.id);
    filename = `baaruveri-threads-${match.slug}.csv`;
  } else {
    threads = await listThreads();
  }

  const rows = threads.map((t) => ({
    id: t.id,
    issue: t.issue,
    island_id: t.island_id ?? "",
    island_slug: t.island_id ? islandsBySlug.get(t.island_id) ?? "" : "",
    title_en: t.title_en,
    title_dv: t.title_dv,
    summary_en: t.summary_en,
    started_by_en: t.started_by_en,
    started_by_dv: t.started_by_dv,
    started_at: t.started_at,
    reply_count: t.reply_count,
    claim_count: t.claim_count,
    vote_count: t.vote_count,
  }));
  return csvResponse(buildCsv(COLUMNS, rows), filename);
}
