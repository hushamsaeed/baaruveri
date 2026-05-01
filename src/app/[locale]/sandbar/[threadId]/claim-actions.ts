"use server";

import { revalidatePath } from "next/cache";
import { getCurrentStubUser } from "@/lib/auth-stub";
import { ensureAnonId } from "@/lib/anon-cookie";
import { pseudonymFor } from "@/lib/pseudonym";
import { commentRequiresVerification } from "@/lib/comment-policy";
import { rateLimit } from "@/lib/rate-limit";
import { getThread } from "@/db/queries/threads";
import { getClaimsForThread, recordClaim } from "@/db/queries/claims";
import {
  makeVoterKey,
  toggleClaimVote,
} from "@/db/queries/claim-votes";

// Anon-tier cookie clears can otherwise yield unlimited claims/votes
// per minute. Limits below are per identity (verified user id or anon
// cookie id), reset every 60s, in-process (single Next.js container is
// the deploy unit). See lib/rate-limit.ts for the multi-instance note.
const CLAIM_LIMIT_PER_MIN = 10;
const VOTE_LIMIT_PER_MIN = 60;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT_REASON =
  "Too many actions in a short window. Try again in a minute.";

const TIER_REQUIRED_REASON =
  "This issue tag requires eFaas verification. Reading and viewing claims is still anonymous.";

export type SubmitClaimResult =
  | { ok: true; claimId: string; pseudonym?: string }
  | { ok: false; reason: string };

export async function submitClaimAction(
  threadId: string,
  side: "pro" | "con",
  bodyEn: string,
  bodyDv: string | null,
  parentClaimId: string | null
): Promise<SubmitClaimResult> {
  const trimmedEn = bodyEn.trim();
  const trimmedDv = bodyDv?.trim() || null;
  if (!trimmedEn) return { ok: false, reason: "Claim body is empty." };
  if (trimmedEn.length > 2000) {
    return { ok: false, reason: "Claim is too long (2000 chars max)." };
  }
  // The HTML form sets maxLength=2000 on both fields, but a curl call
  // bypasses that. Server-side cap keeps the body cap symmetric across
  // both languages.
  if (trimmedDv && trimmedDv.length > 2000) {
    return { ok: false, reason: "Dhivehi claim body is too long (2000 chars max)." };
  }
  if (side !== "pro" && side !== "con") {
    return { ok: false, reason: "Invalid side." };
  }

  const thread = await getThread(threadId);
  if (!thread) return { ok: false, reason: "Thread not found." };

  // Validate parent_claim_id, if set, belongs to the same thread.
  if (parentClaimId) {
    const claims = await getClaimsForThread(threadId);
    if (!claims.some((c) => c.id === parentClaimId)) {
      return { ok: false, reason: "Parent claim not found in this thread." };
    }
  }

  const user = await getCurrentStubUser();
  if (!user && commentRequiresVerification(thread.issue)) {
    return { ok: false, reason: TIER_REQUIRED_REASON };
  }

  let pseudonym: string | undefined;
  let authorEn: string;
  let authorDv: string;
  let rateKey: string;
  if (user) {
    authorEn = user.name_en;
    authorDv = user.name_dv;
    rateKey = `claim:verified:${user.id}`;
  } else {
    const anonId = await ensureAnonId();
    pseudonym = pseudonymFor(anonId, threadId);
    authorEn = pseudonym;
    // For anon authorship we put the same pseudonym in both fields — there's
    // no Dhivehi pseudonym vocabulary yet, and the dv-text utility falls
    // through to Inter for Latin chars.
    authorDv = pseudonym;
    rateKey = `claim:anon:${anonId}`;
  }

  if (!rateLimit(rateKey, CLAIM_LIMIT_PER_MIN, RATE_WINDOW_MS).ok) {
    return { ok: false, reason: RATE_LIMIT_REASON };
  }

  const claim = await recordClaim({
    threadId,
    parentClaimId,
    side,
    bodyEn: trimmedEn,
    bodyDv: trimmedDv,
    authorEn,
    authorDv,
  });

  revalidatePath(`/sandbar/${threadId}`);
  revalidatePath(`/dv/sandbar/${threadId}`);
  revalidatePath(`/en/sandbar/${threadId}`);
  return { ok: true, claimId: claim.id, pseudonym };
}

export type SubmitClaimVoteResult =
  | { ok: true; voted: boolean; newCount: number }
  | { ok: false; reason: string };

export async function submitClaimVoteAction(
  claimId: string,
  threadId: string
): Promise<SubmitClaimVoteResult> {
  const thread = await getThread(threadId);
  if (!thread) return { ok: false, reason: "Thread not found." };

  // Verify the claim is actually in the thread we authorised against.
  // Without this, an anon caller can post a restricted-tier claimId with
  // a non-restricted threadId and bypass commentRequiresVerification.
  const claimsInThread = await getClaimsForThread(threadId);
  if (!claimsInThread.some((c) => c.id === claimId)) {
    return { ok: false, reason: "Claim not found in this thread." };
  }

  const user = await getCurrentStubUser();
  if (!user && commentRequiresVerification(thread.issue)) {
    return { ok: false, reason: TIER_REQUIRED_REASON };
  }

  const voterKey = user
    ? makeVoterKey({ stubUserId: user.id })
    : makeVoterKey({ anonId: await ensureAnonId() });

  if (!rateLimit(`vote:${voterKey}`, VOTE_LIMIT_PER_MIN, RATE_WINDOW_MS).ok) {
    return { ok: false, reason: RATE_LIMIT_REASON };
  }

  const result = await toggleClaimVote(claimId, voterKey);

  revalidatePath(`/sandbar/${threadId}`);
  revalidatePath(`/dv/sandbar/${threadId}`);
  revalidatePath(`/en/sandbar/${threadId}`);
  return { ok: true, voted: result.voted, newCount: result.newCount };
}
