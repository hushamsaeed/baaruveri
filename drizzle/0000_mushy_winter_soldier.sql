CREATE TYPE "public"."claim_side" AS ENUM('pro', 'con');--> statement-breakpoint
CREATE TYPE "public"."council_role" AS ENUM('Chair', 'Vice-Chair', 'Member');--> statement-breakpoint
CREATE TYPE "public"."issue_tag" AS ENUM('housing', 'judiciary', 'climate', 'fisheries', 'education', 'decentralisation', 'procurement');--> statement-breakpoint
CREATE TYPE "public"."petition_scope" AS ENUM('island', 'national');--> statement-breakpoint
CREATE TABLE "budget_lines" (
	"island_id" text NOT NULL,
	"fiscal_year" integer NOT NULL,
	"quarter" smallint NOT NULL,
	"line_item_dv" text NOT NULL,
	"line_item_en" text NOT NULL,
	"allocated_mvr" integer NOT NULL,
	"spent_mvr" integer NOT NULL,
	"yoy_pct" real NOT NULL,
	CONSTRAINT "budget_lines_island_id_fiscal_year_quarter_line_item_en_pk" PRIMARY KEY("island_id","fiscal_year","quarter","line_item_en")
);
--> statement-breakpoint
CREATE TABLE "claims" (
	"id" text PRIMARY KEY NOT NULL,
	"thread_id" text NOT NULL,
	"side" "claim_side" NOT NULL,
	"body_en" text NOT NULL,
	"body_dv" text,
	"author_dv" text NOT NULL,
	"author_en" text NOT NULL,
	"vote_count" integer DEFAULT 0 NOT NULL,
	"impact" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "council_members" (
	"id" text PRIMARY KEY NOT NULL,
	"island_id" text NOT NULL,
	"name_dv" text NOT NULL,
	"name_en" text NOT NULL,
	"role_en" "council_role" NOT NULL,
	"role_dv" text NOT NULL,
	"party" text NOT NULL,
	"ward_en" text,
	"elected_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "islands" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name_dv" text NOT NULL,
	"name_en" text NOT NULL,
	"atoll_dv" text NOT NULL,
	"atoll_en" text NOT NULL,
	"atoll_code" text NOT NULL,
	"population" integer NOT NULL,
	"registered_voters" integer NOT NULL,
	"council_seats" integer NOT NULL,
	"fy26_budget_mvr" integer NOT NULL,
	"active_threads" integer DEFAULT 0 NOT NULL,
	"active_petitions" integer DEFAULT 0 NOT NULL,
	"context_en" text NOT NULL,
	"context_dv" text,
	"population_source_label" text NOT NULL,
	"population_source_year" integer NOT NULL,
	"voters_source_label" text NOT NULL,
	"voters_source_date" text NOT NULL,
	CONSTRAINT "islands_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "petitions" (
	"id" text PRIMARY KEY NOT NULL,
	"title_dv" text NOT NULL,
	"title_en" text NOT NULL,
	"summary_en" text NOT NULL,
	"scope" "petition_scope" NOT NULL,
	"island_id" text,
	"threshold" integer NOT NULL,
	"signatures" integer DEFAULT 0 NOT NULL,
	"closes_at" text NOT NULL,
	"started_by_dv" text NOT NULL,
	"started_by_en" text NOT NULL,
	"started_at" text NOT NULL,
	"efaas_verified_pct" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "signatures" (
	"petition_id" text NOT NULL,
	"stub_user_id" text NOT NULL,
	"signed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "signatures_petition_id_stub_user_id_pk" PRIMARY KEY("petition_id","stub_user_id")
);
--> statement-breakpoint
CREATE TABLE "stub_users" (
	"id" text PRIMARY KEY NOT NULL,
	"name_dv" text NOT NULL,
	"name_en" text NOT NULL,
	"nid" text NOT NULL,
	"island_slug" text NOT NULL,
	"verified_at" text NOT NULL,
	CONSTRAINT "stub_users_nid_unique" UNIQUE("nid")
);
--> statement-breakpoint
CREATE TABLE "threads" (
	"id" text PRIMARY KEY NOT NULL,
	"issue" "issue_tag" NOT NULL,
	"island_id" text,
	"title_dv" text NOT NULL,
	"title_en" text NOT NULL,
	"summary_en" text NOT NULL,
	"started_by_dv" text NOT NULL,
	"started_by_en" text NOT NULL,
	"started_at" text NOT NULL,
	"reply_count" integer DEFAULT 0 NOT NULL,
	"claim_count" integer DEFAULT 0 NOT NULL,
	"vote_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "budget_lines" ADD CONSTRAINT "budget_lines_island_id_islands_id_fk" FOREIGN KEY ("island_id") REFERENCES "public"."islands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_thread_id_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "council_members" ADD CONSTRAINT "council_members_island_id_islands_id_fk" FOREIGN KEY ("island_id") REFERENCES "public"."islands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "petitions" ADD CONSTRAINT "petitions_island_id_islands_id_fk" FOREIGN KEY ("island_id") REFERENCES "public"."islands"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signatures" ADD CONSTRAINT "signatures_petition_id_petitions_id_fk" FOREIGN KEY ("petition_id") REFERENCES "public"."petitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signatures" ADD CONSTRAINT "signatures_stub_user_id_stub_users_id_fk" FOREIGN KEY ("stub_user_id") REFERENCES "public"."stub_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "threads_island_id_islands_id_fk" FOREIGN KEY ("island_id") REFERENCES "public"."islands"("id") ON DELETE set null ON UPDATE no action;