import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { randomBytes } from "crypto";
import { db } from "../index";
import { comments, threads } from "../schema";

export interface Comment {
  id: string;
  thread_id: string;
  parent_comment_id: string | null;
  body_en: string;
  body_dv: string | null;
  // For verified-tier authors:
  author_stub_user_id: string | null;
  author_name_dv: string | null;
  author_name_en: string | null;
  // For anon-tier authors:
  anon_pseudonym: string | null;
  created_at: Date;
  removed_at: Date | null;
}

type Row = typeof comments.$inferSelect;

function rowToComment(r: Row, authorNames?: { dv: string; en: string } | null): Comment {
  return {
    id: r.id,
    thread_id: r.threadId,
    parent_comment_id: r.parentCommentId ?? null,
    body_en: r.bodyEn,
    body_dv: r.bodyDv ?? null,
    author_stub_user_id: r.authorStubUserId ?? null,
    author_name_dv: authorNames?.dv ?? null,
    author_name_en: authorNames?.en ?? null,
    anon_pseudonym: r.anonPseudonym ?? null,
    created_at: r.createdAt,
    removed_at: r.removedAt ?? null,
  };
}

/** All non-removed comments on a thread, sorted oldest-first.
 *  Returns flat list; the UI nests via parent_comment_id. */
export async function getCommentsForThread(threadId: string): Promise<Comment[]> {
  const rows = await db.query.comments.findMany({
    where: and(eq(comments.threadId, threadId), isNull(comments.removedAt)),
    orderBy: [asc(comments.createdAt)],
    with: { author: true },
  });
  return rows.map((r) =>
    rowToComment(
      r,
      r.author ? { dv: r.author.nameDv, en: r.author.nameEn } : null
    )
  );
}

interface RecordCommentInput {
  threadId: string;
  bodyEn: string;
  bodyDv?: string | null;
  parentCommentId?: string | null;
  // Exactly one of these must be set.
  authorStubUserId?: string | null;
  anonPseudonym?: string | null;
}

/** Insert a comment + bump threads.reply_count atomically. Returns the id. */
export async function recordComment(input: RecordCommentInput): Promise<string> {
  const id = `c-${randomBytes(8).toString("hex")}`;
  await db.transaction(async (tx) => {
    await tx.insert(comments).values({
      id,
      threadId: input.threadId,
      parentCommentId: input.parentCommentId ?? null,
      bodyEn: input.bodyEn,
      bodyDv: input.bodyDv ?? null,
      authorStubUserId: input.authorStubUserId ?? null,
      anonPseudonym: input.anonPseudonym ?? null,
    });
    await tx
      .update(threads)
      .set({ replyCount: sql`${threads.replyCount} + 1` })
      .where(eq(threads.id, input.threadId));
  });
  return id;
}
