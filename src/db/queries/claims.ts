import { eq } from "drizzle-orm";
import { db } from "../index";
import { claims as claimsTable } from "../schema";
import type { Claim } from "@/lib/types";

type Row = typeof claimsTable.$inferSelect;

function rowToClaim(r: Row): Claim {
  return {
    id: r.id,
    thread_id: r.threadId,
    side: r.side,
    body_en: r.bodyEn,
    body_dv: r.bodyDv ?? undefined,
    author_dv: r.authorDv,
    author_en: r.authorEn,
    vote_count: r.voteCount,
    impact: r.impact,
  };
}

export async function getClaimsForThread(threadId: string): Promise<Claim[]> {
  const rows = await db
    .select()
    .from(claimsTable)
    .where(eq(claimsTable.threadId, threadId));
  return rows.map(rowToClaim);
}

// Hero thread for v0 = Maafaru airport — exposed as a plain ID constant.
export const HERO_THREAD_ID = "thr-maafaru-01";
