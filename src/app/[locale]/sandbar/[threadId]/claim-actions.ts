"use server";

import { revalidatePath } from "next/cache";
import { getCurrentStubUser } from "@/lib/auth-stub";
import { ensureAnonId } from "@/lib/anon-cookie";
import { pseudonymFor } from "@/lib/pseudonym";
import { commentRequiresVerification } from "@/lib/comment-policy";
import { getThread } from "@/db/queries/threads";
import { getClaimsForThread, recordClaim } from "@/db/queries/claims";
import {
  makeVoterKey,
  toggleClaimVote,
} from "@/db/queries/claim-votes";

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
  if (user) {
    authorEn = user.name_en;
    authorDv = user.name_dv;
  } else {
    const anonId = await ensureAnonId();
    pseudonym = pseudonymFor(anonId, threadId);
    authorEn = pseudonym;
    // For anon authorship we put the same pseudonym in both fields — there's
    // no Dhivehi pseudonym vocabulary yet, and the dv-text utility falls
    // through to Inter for Latin chars.
    authorDv = pseudonym;
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

  const result = await toggleClaimVote(claimId, voterKey);

  revalidatePath(`/sandbar/${threadId}`);
  revalidatePath(`/dv/sandbar/${threadId}`);
  revalidatePath(`/en/sandbar/${threadId}`);
  return { ok: true, voted: result.voted, newCount: result.newCount };
}
