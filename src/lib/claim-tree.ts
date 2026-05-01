import type { Claim } from "@/lib/types";

// Build a parent → children map from a flat array of claims. Roots are
// keyed by null. Children within each bucket are sorted by impact desc,
// vote_count desc, then id asc — same ordering used at every level.
//
// Orphans (claims whose parent_claim_id points at an id not present in the
// input) are surfaced as roots so they remain visible if the parent was
// hard-deleted. Caller should consider this a data-integrity warning, not
// a normal state, but the tree never silently drops content.

export type ClaimsByParent = Map<string | null, Claim[]>;

export function buildClaimTree(claims: readonly Claim[]): ClaimsByParent {
  const byId = new Set(claims.map((c) => c.id));
  const byParent: ClaimsByParent = new Map();

  for (const claim of claims) {
    const key =
      claim.parent_claim_id && byId.has(claim.parent_claim_id)
        ? claim.parent_claim_id
        : null;
    const bucket = byParent.get(key);
    if (bucket) bucket.push(claim);
    else byParent.set(key, [claim]);
  }

  for (const bucket of byParent.values()) {
    bucket.sort((a, b) => {
      if (b.impact !== a.impact) return b.impact - a.impact;
      if (b.vote_count !== a.vote_count) return b.vote_count - a.vote_count;
      return a.id.localeCompare(b.id);
    });
  }

  return byParent;
}

// Subtree depth (root = 0). Returns 0 for an empty/missing branch.
export function subtreeDepth(byParent: ClaimsByParent, rootId: string): number {
  const children = byParent.get(rootId) ?? [];
  if (children.length === 0) return 0;
  return 1 + Math.max(...children.map((c) => subtreeDepth(byParent, c.id)));
}
