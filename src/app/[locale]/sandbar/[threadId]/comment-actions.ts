"use server";

import { revalidatePath } from "next/cache";
import { getCurrentStubUser } from "@/lib/auth-stub";
import { ensureAnonId } from "@/lib/anon-cookie";
import { pseudonymFor } from "@/lib/pseudonym";
import { commentRequiresVerification } from "@/lib/comment-policy";
import { getThread } from "@/db/queries/threads";
import { recordComment } from "@/db/queries/comments";

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
  if (!user) {
    const anonId = await ensureAnonId();
    pseudonym = pseudonymFor(anonId, threadId);
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
