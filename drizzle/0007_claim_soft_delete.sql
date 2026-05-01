-- Soft-delete capability for claims. Mirrors the (now-removed)
-- comments.removed_at + removed_takedown_id pattern from v2.2 — the
-- takedowns log is meaningful only if the records it references can
-- actually be hidden from the public claim tree.
--
-- removed_at: when set, the claim is hidden from getClaimsForThread.
-- removed_takedown_id: opaque foreign reference to a row in `takedowns`
--   so the log entry and the removed row stay linked. No FK constraint
--   here because takedowns can be hard-deleted in dev without orphaning
--   the claim — the column just stores the link.

ALTER TABLE claims ADD COLUMN IF NOT EXISTS removed_at timestamptz;
--> statement-breakpoint
ALTER TABLE claims ADD COLUMN IF NOT EXISTS removed_takedown_id text;
--> statement-breakpoint
-- Partial index restricts the live-set lookup to non-removed rows;
-- removed claims are rare relative to live ones so this stays small.
CREATE INDEX IF NOT EXISTS claims_thread_active_idx
  ON claims (thread_id)
  WHERE removed_at IS NULL;
