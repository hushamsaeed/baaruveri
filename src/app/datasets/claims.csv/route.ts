import { db, schema } from "@/db";
import { getClaimsForThread } from "@/db/queries/claims";
import { buildCsv, csvOptions, csvResponse } from "@/lib/csv";

export const dynamic = "force-dynamic";

const COLUMNS = [
  "id",
  "thread_id",
  "side",
  "body_en",
  "body_dv",
  "author_en",
  "author_dv",
  "vote_count",
  "impact",
  "parent_claim_id",
] as const;

export const OPTIONS = csvOptions;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const threadFilter = searchParams.get("thread");

  let claims;
  let filename = "baaruveri-claims.csv";
  if (threadFilter) {
    claims = await getClaimsForThread(threadFilter);
    filename = `baaruveri-claims-${threadFilter}.csv`;
  } else {
    const rows = await db.select().from(schema.claims);
    claims = rows.map((r) => ({
      id: r.id,
      thread_id: r.threadId,
      parent_claim_id: r.parentClaimId,
      side: r.side,
      body_en: r.bodyEn,
      body_dv: r.bodyDv ?? undefined,
      author_dv: r.authorDv,
      author_en: r.authorEn,
      vote_count: r.voteCount,
      impact: r.impact,
    }));
  }

  const rows = claims.map((c) => ({
    id: c.id,
    thread_id: c.thread_id,
    side: c.side,
    body_en: c.body_en,
    body_dv: c.body_dv ?? "",
    author_en: c.author_en,
    author_dv: c.author_dv,
    vote_count: c.vote_count,
    impact: c.impact,
    parent_claim_id: c.parent_claim_id ?? "",
  }));
  return csvResponse(buildCsv(COLUMNS, rows), filename);
}
