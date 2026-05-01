-- Postgres-backed sliding-window rate limit buckets, replacing the
-- in-memory Map<key,bucket> from v3.9. The in-memory store survived
-- exactly one container; this is the fix for multi-instance scale-out
-- and for the cap surviving deploys.
--
-- Single-statement upsert (see lib/rate-limit.ts) reads + increments +
-- writes in one round-trip. A periodic cleanup of expired rows isn't
-- shipped here — the table grows by ~1 row per (action, identity) per
-- window, capped naturally by traffic, and the read pattern is exact-
-- match by primary key so even a million-row table is sub-ms.
CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  key text PRIMARY KEY,
  count integer NOT NULL,
  reset_at timestamptz NOT NULL
);
--> statement-breakpoint
-- Cleanup helper index: a periodic janitor (or pg_cron job) can run
-- DELETE FROM rate_limit_buckets WHERE reset_at < now() - interval '1 day'
-- and the index keeps the scan cheap.
CREATE INDEX IF NOT EXISTS rate_limit_buckets_reset_at_idx
  ON rate_limit_buckets (reset_at);
