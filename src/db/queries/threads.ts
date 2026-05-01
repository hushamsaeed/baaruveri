import { eq } from "drizzle-orm";
import { db } from "../index";
import { threads as threadsTable } from "../schema";
import type { Thread } from "@/lib/types";

type Row = typeof threadsTable.$inferSelect;

function rowToThread(r: Row): Thread {
  return {
    id: r.id,
    issue: r.issue,
    island_id: r.islandId,
    title_dv: r.titleDv,
    title_en: r.titleEn,
    summary_en: r.summaryEn,
    started_by_dv: r.startedByDv,
    started_by_en: r.startedByEn,
    started_at: r.startedAt,
    reply_count: r.replyCount,
    claim_count: r.claimCount,
    vote_count: r.voteCount,
  };
}

export async function listThreads(): Promise<Thread[]> {
  const rows = await db.select().from(threadsTable);
  return rows.map(rowToThread);
}

export async function getThread(id: string): Promise<Thread | undefined> {
  const rows = await db
    .select()
    .from(threadsTable)
    .where(eq(threadsTable.id, id))
    .limit(1);
  return rows[0] ? rowToThread(rows[0]) : undefined;
}

export async function getThreadsForIsland(islandId: string): Promise<Thread[]> {
  const rows = await db
    .select()
    .from(threadsTable)
    .where(eq(threadsTable.islandId, islandId));
  return rows.map(rowToThread);
}
