import {
  pgTable,
  pgEnum,
  text,
  integer,
  real,
  smallint,
  timestamp,
  primaryKey,
  index,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ===== Enums =====
export const issueTagEnum = pgEnum("issue_tag", [
  "housing",
  "judiciary",
  "climate",
  "fisheries",
  "education",
  "decentralisation",
  "procurement",
]);

export const claimSideEnum = pgEnum("claim_side", ["pro", "con"]);

export const petitionScopeEnum = pgEnum("petition_scope", ["island", "national"]);

export const councilRoleEnum = pgEnum("council_role", [
  "Chair",
  "Vice-Chair",
  "Member",
]);

// Per moderation policy §04 — narrow list of removable categories.
export const takedownReasonEnum = pgEnum("takedown_reason", [
  "threat",
  "doxx",
  "csam",
  "coordinated_inauthentic",
  "signature_fraud",
]);

export const takedownTargetKindEnum = pgEnum("takedown_target_kind", [
  "comment",
  "claim",
  "thread",
]);

export const takedownAppealStatusEnum = pgEnum("takedown_appeal_status", [
  "none",
  "pending",
  "upheld",
  "overturned",
]);

// ===== Tables =====

export const islands = pgTable("islands", {
  id: text("id").primaryKey(), // e.g. "K-male", "N-maafaru"
  slug: text("slug").notNull().unique(),
  nameDv: text("name_dv").notNull(),
  nameEn: text("name_en").notNull(),
  atollDv: text("atoll_dv").notNull(),
  atollEn: text("atoll_en").notNull(),
  atollCode: text("atoll_code").notNull(),
  population: integer("population").notNull(),
  registeredVoters: integer("registered_voters").notNull(),
  councilSeats: integer("council_seats").notNull(),
  fy26BudgetMvr: integer("fy26_budget_mvr").notNull(),
  activeThreads: integer("active_threads").notNull().default(0),
  activePetitions: integer("active_petitions").notNull().default(0),
  contextEn: text("context_en").notNull(),
  contextDv: text("context_dv"),
  // Provenance: denormalised from Island.population_source / voters_source
  populationSourceLabel: text("population_source_label").notNull(),
  populationSourceYear: integer("population_source_year").notNull(),
  votersSourceLabel: text("voters_source_label").notNull(),
  votersSourceDate: text("voters_source_date").notNull(), // ISO date string
});

export const councilMembers = pgTable("council_members", {
  id: text("id").primaryKey(),
  islandId: text("island_id")
    .notNull()
    .references(() => islands.id, { onDelete: "cascade" }),
  nameDv: text("name_dv").notNull(),
  nameEn: text("name_en").notNull(),
  roleEn: councilRoleEnum("role_en").notNull(),
  roleDv: text("role_dv").notNull(),
  party: text("party").notNull(),
  wardEn: text("ward_en"),
  electedAt: text("elected_at").notNull(),
});

export const budgetLines = pgTable(
  "budget_lines",
  {
    islandId: text("island_id")
      .notNull()
      .references(() => islands.id, { onDelete: "cascade" }),
    fiscalYear: integer("fiscal_year").notNull(),
    quarter: smallint("quarter").notNull(),
    lineItemDv: text("line_item_dv").notNull(),
    lineItemEn: text("line_item_en").notNull(),
    allocatedMvr: integer("allocated_mvr").notNull(),
    spentMvr: integer("spent_mvr").notNull(),
    yoyPct: real("yoy_pct").notNull(),
  },
  (t) => ({
    pk: primaryKey({
      columns: [t.islandId, t.fiscalYear, t.quarter, t.lineItemEn],
    }),
  })
);

export const threads = pgTable("threads", {
  id: text("id").primaryKey(),
  issue: issueTagEnum("issue").notNull(),
  islandId: text("island_id").references(() => islands.id, {
    onDelete: "set null",
  }),
  titleDv: text("title_dv").notNull(),
  titleEn: text("title_en").notNull(),
  summaryEn: text("summary_en").notNull(),
  startedByDv: text("started_by_dv").notNull(),
  startedByEn: text("started_by_en").notNull(),
  startedAt: text("started_at").notNull(),
  replyCount: integer("reply_count").notNull().default(0),
  claimCount: integer("claim_count").notNull().default(0),
  voteCount: integer("vote_count").notNull().default(0),
});

export const claims = pgTable("claims", {
  id: text("id").primaryKey(),
  threadId: text("thread_id")
    .notNull()
    .references(() => threads.id, { onDelete: "cascade" }),
  // Self-FK for Kialo-style nested claims. NULL = root claim (pro/con
  // relative to the thread question). Non-null = supports/rebuts the
  // referenced parent claim. AnyPgColumn cast breaks the typed self-cycle.
  parentClaimId: text("parent_claim_id").references(
    (): AnyPgColumn => claims.id,
    { onDelete: "cascade" }
  ),
  side: claimSideEnum("side").notNull(),
  bodyEn: text("body_en").notNull(),
  bodyDv: text("body_dv"),
  authorDv: text("author_dv").notNull(),
  authorEn: text("author_en").notNull(),
  // Denormalised counter — sum of claim_votes rows. Updated in the same
  // transaction as the vote insert/delete so reads stay cheap. Seed values
  // are synthetic baselines (same pattern as petitions.signatures); real
  // session votes accumulate on top via the claim_votes ledger.
  voteCount: integer("vote_count").notNull().default(0),
  impact: real("impact").notNull(),
});

// One vote per (claim, voter). voter_key is "verified:<stub_user_id>" for
// eFaas-tier voters or "anon:<anon_cookie>" for anonymous-tier voters —
// single tagged string keeps dedup as a clean composite PK without
// nullable per-tier columns.
export const claimVotes = pgTable(
  "claim_votes",
  {
    claimId: text("claim_id")
      .notNull()
      .references(() => claims.id, { onDelete: "cascade" }),
    voterKey: text("voter_key").notNull(),
    votedAt: timestamp("voted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.claimId, t.voterKey] }),
  })
);

export const petitions = pgTable("petitions", {
  id: text("id").primaryKey(),
  titleDv: text("title_dv").notNull(),
  titleEn: text("title_en").notNull(),
  summaryEn: text("summary_en").notNull(),
  scope: petitionScopeEnum("scope").notNull(),
  islandId: text("island_id").references(() => islands.id, {
    onDelete: "set null",
  }),
  threshold: integer("threshold").notNull(),
  // SYNTHETIC BASELINE only — represents prior signatures from outside this
  // session (e.g. the seeded "3247 already signed" demo number on the HDC
  // arrears petition). Live session signatures accumulate in the `signatures`
  // table on top of this. The displayed number is `signatures + count(*)
  // from signatures`. Renaming to `signatures_baseline` is on the v2.x list
  // but not worth a migration for clarity-only.
  signatures: integer("signatures").notNull().default(0),
  closesAt: text("closes_at").notNull(),
  startedByDv: text("started_by_dv").notNull(),
  startedByEn: text("started_by_en").notNull(),
  startedAt: text("started_at").notNull(),
  efaasVerifiedPct: integer("efaas_verified_pct").notNull(),
});

export const stubUsers = pgTable("stub_users", {
  id: text("id").primaryKey(), // e.g. "u-naseem"
  nameDv: text("name_dv").notNull(),
  nameEn: text("name_en").notNull(),
  nid: text("nid").notNull().unique(),
  islandSlug: text("island_slug").notNull(),
  verifiedAt: text("verified_at").notNull(),
});

// Free-form comments on threads. Author is either an eFaas-verified stub
// user (author_stub_user_id set) OR an anon-tier poster (author_stub_user_id
// null + anon_pseudonym set, derived per (anon-cookie × thread) pair).
// Soft-delete via removed_at + foreign key into takedowns.
export const comments = pgTable("comments", {
  id: text("id").primaryKey(),
  threadId: text("thread_id")
    .notNull()
    .references(() => threads.id, { onDelete: "cascade" }),
  // Self-FK with cascade, mirroring claims.parentClaimId. AnyPgColumn
  // breaks the typed self-cycle. Migration 0004 adds the constraint to
  // existing rows; the application layer additionally enforces
  // same-thread parent in submitCommentAction.
  parentCommentId: text("parent_comment_id").references(
    (): AnyPgColumn => comments.id,
    { onDelete: "cascade" }
  ),
  bodyEn: text("body_en").notNull(),
  bodyDv: text("body_dv"),
  authorStubUserId: text("author_stub_user_id").references(() => stubUsers.id, {
    onDelete: "set null",
  }),
  // Set when authorStubUserId is null (anon-tier). Stored at insert time so
  // the displayed handle is stable even if the pseudonym vocab changes later.
  anonPseudonym: text("anon_pseudonym"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  removedAt: timestamp("removed_at", { withTimezone: true }),
  removedTakedownId: text("removed_takedown_id"),
});

// Public takedown log (moderation policy §05). Every removal lands here;
// anyone can read, drives the /about/takedowns page.
export const takedowns = pgTable("takedowns", {
  id: text("id").primaryKey(),
  targetKind: takedownTargetKindEnum("target_kind").notNull(),
  targetId: text("target_id").notNull(),
  reasonCategory: takedownReasonEnum("reason_category").notNull(),
  moderatorRationale: text("moderator_rationale").notNull(),
  // Snapshot of how the author was attributed at the time of the takedown
  // (e.g. "anon: yellowfin-grouper-12" or "verified: ޚަދީޖާ ނަދީމާ").
  // Stored so the log remains meaningful even if the original record is
  // hard-deleted later.
  originalAuthorDisplay: text("original_author_display").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  appealStatus: takedownAppealStatusEnum("appeal_status")
    .notNull()
    .default("none"),
  appealResolvedAt: timestamp("appeal_resolved_at", { withTimezone: true }),
});

// Postgres-backed rate-limit buckets. Replaces the in-memory Map<>
// limiter from v3.9 so caps survive container restarts and span
// horizontally-scaled instances. Migration 0005.
export const rateLimitBuckets = pgTable(
  "rate_limit_buckets",
  {
    key: text("key").primaryKey(),
    count: integer("count").notNull(),
    resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    resetAtIdx: index("rate_limit_buckets_reset_at_idx").on(t.resetAt),
  })
);

// Replaces signature-store.ts. Composite PK doubles as the dedup constraint.
export const signaturesTable = pgTable(
  "signatures",
  {
    petitionId: text("petition_id")
      .notNull()
      .references(() => petitions.id, { onDelete: "cascade" }),
    stubUserId: text("stub_user_id")
      .notNull()
      .references(() => stubUsers.id, { onDelete: "cascade" }),
    signedAt: timestamp("signed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.petitionId, t.stubUserId] }),
  })
);

// ===== Relations (powers the Drizzle relational query API) =====

export const islandsRelations = relations(islands, ({ many }) => ({
  council: many(councilMembers),
  budgetLines: many(budgetLines),
  threads: many(threads),
  petitions: many(petitions),
}));

export const councilMembersRelations = relations(councilMembers, ({ one }) => ({
  island: one(islands, {
    fields: [councilMembers.islandId],
    references: [islands.id],
  }),
}));

export const budgetLinesRelations = relations(budgetLines, ({ one }) => ({
  island: one(islands, {
    fields: [budgetLines.islandId],
    references: [islands.id],
  }),
}));

export const threadsRelations = relations(threads, ({ one, many }) => ({
  island: one(islands, {
    fields: [threads.islandId],
    references: [islands.id],
  }),
  claims: many(claims),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  thread: one(threads, {
    fields: [comments.threadId],
    references: [threads.id],
  }),
  parent: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
    relationName: "comment_replies",
  }),
  replies: many(comments, { relationName: "comment_replies" }),
  author: one(stubUsers, {
    fields: [comments.authorStubUserId],
    references: [stubUsers.id],
  }),
}));

export const claimsRelations = relations(claims, ({ one, many }) => ({
  thread: one(threads, {
    fields: [claims.threadId],
    references: [threads.id],
  }),
  parent: one(claims, {
    fields: [claims.parentClaimId],
    references: [claims.id],
    relationName: "claim_children",
  }),
  children: many(claims, { relationName: "claim_children" }),
  votes: many(claimVotes),
}));

export const claimVotesRelations = relations(claimVotes, ({ one }) => ({
  claim: one(claims, {
    fields: [claimVotes.claimId],
    references: [claims.id],
  }),
}));

export const petitionsRelations = relations(petitions, ({ one, many }) => ({
  island: one(islands, {
    fields: [petitions.islandId],
    references: [islands.id],
  }),
  signatures: many(signaturesTable),
}));

export const stubUsersRelations = relations(stubUsers, ({ many }) => ({
  signatures: many(signaturesTable),
}));

export const signaturesRelations = relations(signaturesTable, ({ one }) => ({
  petition: one(petitions, {
    fields: [signaturesTable.petitionId],
    references: [petitions.id],
  }),
  user: one(stubUsers, {
    fields: [signaturesTable.stubUserId],
    references: [stubUsers.id],
  }),
}));
