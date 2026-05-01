"use server";

import { revalidatePath } from "next/cache";
import { getCurrentStubUser } from "@/lib/auth-stub";
import { ensureAnonId } from "@/lib/anon-cookie";
import { pseudonymFor } from "@/lib/pseudonym";
import { commentRequiresVerification } from "@/lib/comment-policy";
import { rateLimit } from "@/lib/rate-limit";
import { getThread } from "@/db/queries/threads";
import { getCommentsForThread, recordComment } from "@/db/queries/comments";

const COMMENT_LIMIT_PER_MIN = 20;
const COMMENT_WINDOW_MS = 60_000;

export type SubmitCommentResult =
  | { ok: true; commentId: string; pseudonym?: string }
  | { ok: false; reason: string };

export async function submitCommentAction(
  threadId: string,
  bodyEn: string,
  parentCommentId?: string | null
): Promise<SubmitCommentResult> {
  const trimmed = bodyEn.trim();
  if (!trimmed) return { ok: false, reason: "Comment body is empty." };
  if (trimmed.length > 4000) {
    return { ok: false, reason: "Comment is too long (4000 chars max)." };
  }

  const thread = await getThread(threadId);
  if (!thread) return { ok: false, reason: "Thread not found." };

  // Mirrors submitClaimAction's parentClaimId guard. Without this, a
  // forged parentCommentId can orphan-link a reply across threads (the
  // 0004 self-FK keeps the row referentially valid but the action layer
  // is the right place to enforce same-thread reply scope).
  if (parentCommentId) {
    const threadComments = await getCommentsForThread(threadId);
    if (!threadComments.some((c) => c.id === parentCommentId)) {
      return { ok: false, reason: "Parent comment not found in this thread." };
    }
  }

  const user = await getCurrentStubUser();

  // Per moderation policy §02 — flagged issues require eFaas-verified posting.
  if (!user && commentRequiresVerification(thread.issue)) {
    return {
      ok: false,
      reason:
        "This issue tag requires eFaas verification to post. Reading and voting are still anonymous.",
    };
  }

  let pseudonym: string | undefined;
  let rateKey: string;
  if (user) {
    rateKey = `comment:verified:${user.id}`;
  } else {
    const anonId = await ensureAnonId();
    pseudonym = pseudonymFor(anonId, threadId);
    rateKey = `comment:anon:${anonId}`;
  }

  if (!(await rateLimit(rateKey, COMMENT_LIMIT_PER_MIN, COMMENT_WINDOW_MS)).ok) {
    return {
      ok: false,
      reason: "Too many comments in a short window. Try again in a minute.",
    };
  }

  const commentId = await recordComment({
    threadId,
    bodyEn: trimmed,
    parentCommentId: parentCommentId ?? null,
    authorStubUserId: user?.id ?? null,
    anonPseudonym: pseudonym ?? null,
  });

  revalidatePath(`/sandbar/${threadId}`);
  return { ok: true, commentId, pseudonym };
}
