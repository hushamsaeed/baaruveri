-- Drop the v2.2 comments primitive. The Kialo-style claim tree (v3.0)
-- subsumes its role: every "post" on a thread is now a structured pro/con
-- position with parent_claim_id self-FK threading, voting, and the same
-- eFaas tier policy. See v4.0 batch G for the rationale.
--
-- threads.reply_count was incremented by the (now-gone) comment writer;
-- the column is dead weight after this migration. UI consumers switch to
-- claim_count, which is incremented by recordClaim().
--
-- takedown_target_kind enum keeps the "comment" value because Postgres
-- enums can't easily drop members. New takedowns will only use "claim"
-- or "thread"; legacy "comment" rows (zero in prod) stay valid.

DROP TABLE IF EXISTS comments CASCADE;
--> statement-breakpoint
ALTER TABLE threads DROP COLUMN IF EXISTS reply_count;
