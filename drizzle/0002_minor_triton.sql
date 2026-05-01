CREATE TABLE "claim_votes" (
	"claim_id" text NOT NULL,
	"voter_key" text NOT NULL,
	"voted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "claim_votes_claim_id_voter_key_pk" PRIMARY KEY("claim_id","voter_key")
);
--> statement-breakpoint
ALTER TABLE "claims" ADD COLUMN "parent_claim_id" text;--> statement-breakpoint
ALTER TABLE "claim_votes" ADD CONSTRAINT "claim_votes_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_parent_claim_id_claims_id_fk" FOREIGN KEY ("parent_claim_id") REFERENCES "public"."claims"("id") ON DELETE cascade ON UPDATE no action;