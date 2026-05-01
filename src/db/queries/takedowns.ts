import { desc } from "drizzle-orm";
import { db } from "../index";
import { takedowns } from "../schema";

export interface Takedown {
  id: string;
  target_kind: "comment" | "claim" | "thread";
  target_id: string;
  reason_category:
    | "threat"
    | "doxx"
    | "csam"
    | "coordinated_inauthentic"
    | "signature_fraud";
  moderator_rationale: string;
  original_author_display: string;
  created_at: Date;
  appeal_status: "none" | "pending" | "upheld" | "overturned";
  appeal_resolved_at: Date | null;
}

type Row = typeof takedowns.$inferSelect;

function rowToTakedown(r: Row): Takedown {
  return {
    id: r.id,
    target_kind: r.targetKind,
    target_id: r.targetId,
    reason_category: r.reasonCategory,
    moderator_rationale: r.moderatorRationale,
    original_author_display: r.originalAuthorDisplay,
    created_at: r.createdAt,
    appeal_status: r.appealStatus,
    appeal_resolved_at: r.appealResolvedAt ?? null,
  };
}

export async function listTakedowns(): Promise<Takedown[]> {
  const rows = await db
    .select()
    .from(takedowns)
    .orderBy(desc(takedowns.createdAt));
  return rows.map(rowToTakedown);
}
