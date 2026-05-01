CREATE TYPE "public"."takedown_appeal_status" AS ENUM('none', 'pending', 'upheld', 'overturned');--> statement-breakpoint
CREATE TYPE "public"."takedown_reason" AS ENUM('threat', 'doxx', 'csam', 'coordinated_inauthentic', 'signature_fraud');--> statement-breakpoint
CREATE TYPE "public"."takedown_target_kind" AS ENUM('comment', 'claim', 'thread');--> statement-breakpoint
CREATE TABLE "comments" (
	"id" text PRIMARY KEY NOT NULL,
	"thread_id" text NOT NULL,
	"parent_comment_id" text,
	"body_en" text NOT NULL,
	"body_dv" text,
	"author_stub_user_id" text,
	"anon_pseudonym" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"removed_at" timestamp with time zone,
	"removed_takedown_id" text
);
--> statement-breakpoint
CREATE TABLE "takedowns" (
	"id" text PRIMARY KEY NOT NULL,
	"target_kind" "takedown_target_kind" NOT NULL,
	"target_id" text NOT NULL,
	"reason_category" "takedown_reason" NOT NULL,
	"moderator_rationale" text NOT NULL,
	"original_author_display" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"appeal_status" "takedown_appeal_status" DEFAULT 'none' NOT NULL,
	"appeal_resolved_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_thread_id_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_stub_user_id_stub_users_id_fk" FOREIGN KEY ("author_stub_user_id") REFERENCES "public"."stub_users"("id") ON DELETE set null ON UPDATE no action;