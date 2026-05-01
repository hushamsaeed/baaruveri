import {
  pgTable,
  pgEnum,
  text,
  integer,
  real,
  smallint,
  timestamp,
  primaryKey,
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
  side: claimSideEnum("side").notNull(),
  bodyEn: text("body_en").notNull(),
  bodyDv: text("body_dv"),
  authorDv: text("author_dv").notNull(),
  authorEn: text("author_en").notNull(),
  voteCount: integer("vote_count").notNull().default(0),
  impact: real("impact").notNull(),
});

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
}));

export const claimsRelations = relations(claims, ({ one }) => ({
  thread: one(threads, {
    fields: [claims.threadId],
    references: [threads.id],
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
