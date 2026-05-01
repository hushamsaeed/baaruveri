-- Five missing FK btree indexes flagged by the multi-agent perf audit
-- (Batch C of the rollout). All cover columns used in WHERE / JOIN /
-- ORDER BY hot paths but with no index after 0000–0003.
--
-- Note on locking: ideally these would use CREATE INDEX CONCURRENTLY,
-- but drizzle-kit's migrate() wraps each .sql file in a transaction and
-- CONCURRENTLY cannot run inside a transaction. With current data
-- volumes (single-digit islands, low-hundreds of rows total) the
-- non-concurrent variant takes milliseconds and the lock window is
-- inconsequential. Once tables grow to thousands of rows + live insert
-- traffic we'll need a separate non-transactional migration runner.

-- Hot path: thread detail page reads claims by thread_id on every render.
CREATE INDEX IF NOT EXISTS claims_thread_id_idx ON claims (thread_id);
--> statement-breakpoint

-- Hot path: claim-tree.ts walks parent_claim_id; partial index because
-- most claims are roots (parent_claim_id IS NULL).
CREATE INDEX IF NOT EXISTS claims_parent_claim_id_idx
  ON claims (parent_claim_id)
  WHERE parent_claim_id IS NOT NULL;
--> statement-breakpoint

-- Hot path: thread detail reads non-removed comments ordered by
-- created_at. Partial index restricts to the live set.
CREATE INDEX IF NOT EXISTS comments_thread_active_idx
  ON comments (thread_id, created_at)
  WHERE removed_at IS NULL;
--> statement-breakpoint

-- "What have I voted on" query — composite PK leads on claim_id, so a
-- voter-only filter scans without this.
CREATE INDEX IF NOT EXISTS claim_votes_voter_idx ON claim_votes (voter_key);
--> statement-breakpoint

-- "What petitions has this user signed" — composite PK leads on
-- petition_id, so per-user lookups need this.
CREATE INDEX IF NOT EXISTS signatures_stub_user_idx
  ON signatures (stub_user_id);
--> statement-breakpoint

-- Self-FK on comments.parent_comment_id (was bare text — claims has
-- the equivalent FK with cascade). Closes orphan + cross-thread reply
-- footguns; the application-layer same-thread check still validates
-- before insert.
ALTER TABLE comments
  ADD CONSTRAINT comments_parent_comment_id_fk
  FOREIGN KEY (parent_comment_id)
  REFERENCES comments (id)
  ON DELETE CASCADE;
--> statement-breakpoint

-- Index for the FK we just added (cascades scan the dependent rows).
CREATE INDEX IF NOT EXISTS comments_parent_comment_id_idx
  ON comments (parent_comment_id)
  WHERE parent_comment_id IS NOT NULL;
--> statement-breakpoint

-- Future-proofing: takedowns lookups by (kind, id). Cheap on the
-- ~0-row table today; matters once moderation activity grows.
CREATE INDEX IF NOT EXISTS takedowns_target_idx
  ON takedowns (target_kind, target_id);
