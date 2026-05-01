import { eq, sql } from "drizzle-orm";
import { db } from "../index";
import { claims as claimsTable, threads as threadsTable } from "../schema";
import type { Claim } from "@/lib/types";

type Row = typeof claimsTable.$inferSelect;

function rowToClaim(r: Row): Claim {
  return {
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
  };
}

export async function getClaimsForThread(threadId: string): Promise<Claim[]> {
  const rows = await db
    .select()
    .from(claimsTable)
    .where(eq(claimsTable.threadId, threadId));
  return rows.map(rowToClaim);
}

export interface RecordClaimInput {
  threadId: string;
  parentClaimId: string | null;
  side: "pro" | "con";
  bodyEn: string;
  bodyDv: string | null;
  authorEn: string;
  authorDv: string;
}

export async function recordClaim(input: RecordClaimInput): Promise<Claim> {
  // ID format mirrors the seed convention: cl-<thread-stem>-<random>. The
  // thread stem keeps grep-ability; the random suffix avoids collisions.
  const threadStem = input.threadId.replace(/^thr-/, "");
  const id = `cl-${threadStem}-${Math.random().toString(36).slice(2, 10)}`;

  return await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(claimsTable)
      .values({
        id,
        threadId: input.threadId,
        parentClaimId: input.parentClaimId,
        side: input.side,
        bodyEn: input.bodyEn,
        bodyDv: input.bodyDv,
        authorDv: input.authorDv,
        authorEn: input.authorEn,
        voteCount: 0,
        impact: 0,
      })
      .returning();

    // Bump the denormalised claim_count on the thread.
    await tx
      .update(threadsTable)
      .set({ claimCount: sql`${threadsTable.claimCount} + 1` })
      .where(eq(threadsTable.id, input.threadId));

    return rowToClaim(inserted);
  });
}

// Hero thread for v0 = Maafaru airport — exposed as a plain ID constant.
export const HERO_THREAD_ID = "thr-maafaru-01";
