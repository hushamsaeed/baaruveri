import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "../index";
import { claims as claimsTable, claimVotes } from "../schema";

// voter_key is "verified:<stub_user_id>" or "anon:<anon_cookie>" — see
// schema.ts comment on claim_votes.

export function makeVoterKey(opts: {
  stubUserId?: string | null;
  anonId?: string | null;
}): string {
  if (opts.stubUserId) return `verified:${opts.stubUserId}`;
  if (opts.anonId) return `anon:${opts.anonId}`;
  throw new Error("makeVoterKey: need stubUserId or anonId");
}

// Returns the set of claim_ids the given voter has already upvoted within
// the supplied list. Used to render "voted" state alongside the tree.
export async function getVotedClaimIds(
  voterKey: string,
  claimIds: readonly string[]
): Promise<Set<string>> {
  if (claimIds.length === 0) return new Set();
  const rows = await db
    .select({ claimId: claimVotes.claimId })
    .from(claimVotes)
    .where(
      and(
        eq(claimVotes.voterKey, voterKey),
        inArray(claimVotes.claimId, [...claimIds])
      )
    );
  return new Set(rows.map((r) => r.claimId));
}

export interface ToggleVoteResult {
  voted: boolean; // true if the vote now exists; false if it was retracted
  newCount: number;
}

// Toggles a single upvote. Same call from anon or verified — voter_key
// resolves the identity. Atomic: vote ledger row + counter update happen
// in one transaction.
export async function toggleClaimVote(
  claimId: string,
  voterKey: string
): Promise<ToggleVoteResult> {
  return await db.transaction(async (tx) => {
    const existing = await tx
      .select({ claimId: claimVotes.claimId })
      .from(claimVotes)
      .where(
        and(eq(claimVotes.claimId, claimId), eq(claimVotes.voterKey, voterKey))
      );

    if (existing.length > 0) {
      // Retract.
      await tx
        .delete(claimVotes)
        .where(
          and(
            eq(claimVotes.claimId, claimId),
            eq(claimVotes.voterKey, voterKey)
          )
        );
      const [{ voteCount }] = await tx
        .update(claimsTable)
        .set({ voteCount: sql`greatest(${claimsTable.voteCount} - 1, 0)` })
        .where(eq(claimsTable.id, claimId))
        .returning({ voteCount: claimsTable.voteCount });
      return { voted: false, newCount: voteCount };
    }

    // Insert.
    await tx.insert(claimVotes).values({ claimId, voterKey });
    const [{ voteCount }] = await tx
      .update(claimsTable)
      .set({ voteCount: sql`${claimsTable.voteCount} + 1` })
      .where(eq(claimsTable.id, claimId))
      .returning({ voteCount: claimsTable.voteCount });
    return { voted: true, newCount: voteCount };
  });
}
