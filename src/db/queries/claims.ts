import { and, eq, isNull, sql } from "drizzle-orm";
import { randomBytes } from "crypto";
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
  // Filters soft-deleted (migration 0007). The partial index
  // claims_thread_active_idx covers this exact predicate so the lookup
  // stays cheap as the table grows.
  const rows = await db
    .select()
    .from(claimsTable)
    .where(
      and(
        eq(claimsTable.threadId, threadId),
        isNull(claimsTable.removedAt)
      )
    );
  return rows.map(rowToClaim);
}

/** Soft-delete a claim. Sets removed_at + removed_takedown_id. The
 *  takedown row referenced should be created by the caller in the
 *  same transaction; this function does the claim-side update only.
 *  No matching server action yet — admin UI is post-v0; for now this
 *  is invoked via DB tooling or a future moderation endpoint. */
export async function softDeleteClaim(
  claimId: string,
  takedownId: string
): Promise<void> {
  await db
    .update(claimsTable)
    .set({ removedAt: new Date(), removedTakedownId: takedownId })
    .where(eq(claimsTable.id, claimId));
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
  // thread stem keeps grep-ability; the random suffix uses crypto bytes
  // (matches comments.ts) so the entropy is real and we don't risk PK
  // collisions from a session getting unlucky on Math.random.
  const threadStem = input.threadId.replace(/^thr-/, "");
  const id = `cl-${threadStem}-${randomBytes(4).toString("hex")}`;

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
