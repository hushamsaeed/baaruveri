-- pg_trgm extension + trigram GIN indexes on the columns site search
-- queries (queries/search.ts). Enables similarity()-based ranking so the
-- exact / closest-prefix matches surface above incidental matches —
-- replaces the earlier insertion-order ILIKE behaviour.

CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS islands_name_en_trgm ON islands USING gin (name_en gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS islands_name_dv_trgm ON islands USING gin (name_dv gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS islands_atoll_en_trgm ON islands USING gin (atoll_en gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS islands_context_en_trgm ON islands USING gin (context_en gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS threads_title_en_trgm ON threads USING gin (title_en gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS threads_title_dv_trgm ON threads USING gin (title_dv gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS threads_summary_en_trgm ON threads USING gin (summary_en gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS petitions_title_en_trgm ON petitions USING gin (title_en gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS petitions_title_dv_trgm ON petitions USING gin (title_dv gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS petitions_summary_en_trgm ON petitions USING gin (summary_en gin_trgm_ops);
