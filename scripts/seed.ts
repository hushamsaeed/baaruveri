// Seed the database from the in-repo fixture arrays. Idempotent via
// onConflictDoNothing, so re-running just logs zero new inserts.
//
//   pnpm db:seed
//
// After this script runs, the fixture files at src/data/*.ts become
// seed-only — runtime reads come from Postgres via src/db/queries/*.ts.

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { db, schema } from "../src/db";
import { islands as islandsFixture } from "../src/data/islands";
import { councilMembers as councilFixture } from "../src/data/council-members";
import { budgetLines as budgetFixture } from "../src/data/budget-lines";
import { threads as threadsFixture } from "../src/data/threads";
import { petitions as petitionsFixture } from "../src/data/petitions";
import { claims as claimsFixture } from "../src/data/claims";
import { STUB_USERS } from "../src/data/stub-users";

async function seed() {
  console.log("Seeding Baaruveri database…\n");

  // --- Islands (no FKs depend on this yet) ---
  const islandsRows = islandsFixture.map((i) => ({
    id: i.id,
    slug: i.slug,
    nameDv: i.name_dv,
    nameEn: i.name_en,
    atollDv: i.atoll_dv,
    atollEn: i.atoll_en,
    atollCode: i.atoll_code,
    population: i.population,
    registeredVoters: i.registered_voters,
    councilSeats: i.council_seats,
    fy26BudgetMvr: i.fy26_budget_mvr,
    activeThreads: i.active_threads,
    activePetitions: i.active_petitions,
    contextEn: i.context_en,
    contextDv: i.context_dv ?? null,
    populationSourceLabel: i.population_source.label,
    populationSourceYear: i.population_source.year,
    votersSourceLabel: i.voters_source.label,
    votersSourceDate: i.voters_source.date,
  }));
  const insertedIslands = await db
    .insert(schema.islands)
    .values(islandsRows)
    .onConflictDoNothing()
    .returning({ id: schema.islands.id });
  console.log(`  islands           ${insertedIslands.length} inserted (of ${islandsRows.length})`);

  // --- Council members (FK islands) ---
  const councilRows = councilFixture.map((c) => ({
    id: c.id,
    islandId: c.island_id,
    nameDv: c.name_dv,
    nameEn: c.name_en,
    roleEn: c.role_en,
    roleDv: c.role_dv,
    party: c.party,
    wardEn: c.ward_en ?? null,
    electedAt: c.elected_at,
  }));
  const insertedCouncil = await db
    .insert(schema.councilMembers)
    .values(councilRows)
    .onConflictDoNothing()
    .returning({ id: schema.councilMembers.id });
  console.log(`  council_members   ${insertedCouncil.length} inserted (of ${councilRows.length})`);

  // --- Budget lines (FK islands; composite PK) ---
  const budgetRows = budgetFixture.map((b) => ({
    islandId: b.island_id,
    fiscalYear: b.fiscal_year,
    quarter: b.quarter,
    lineItemDv: b.line_item_dv,
    lineItemEn: b.line_item_en,
    allocatedMvr: b.allocated_mvr,
    spentMvr: b.spent_mvr,
    yoyPct: b.yoy_pct,
  }));
  const insertedBudget = await db
    .insert(schema.budgetLines)
    .values(budgetRows)
    .onConflictDoNothing()
    .returning({ islandId: schema.budgetLines.islandId });
  console.log(`  budget_lines      ${insertedBudget.length} inserted (of ${budgetRows.length})`);

  // --- Threads (FK islands nullable) ---
  const threadsRows = threadsFixture.map((t) => ({
    id: t.id,
    issue: t.issue,
    islandId: t.island_id,
    titleDv: t.title_dv,
    titleEn: t.title_en,
    summaryEn: t.summary_en,
    startedByDv: t.started_by_dv,
    startedByEn: t.started_by_en,
    startedAt: t.started_at,
    replyCount: t.reply_count,
    claimCount: t.claim_count,
    voteCount: t.vote_count,
  }));
  const insertedThreads = await db
    .insert(schema.threads)
    .values(threadsRows)
    .onConflictDoNothing()
    .returning({ id: schema.threads.id });
  console.log(`  threads           ${insertedThreads.length} inserted (of ${threadsRows.length})`);

  // --- Petitions (FK islands nullable). signatures column carries the
  //     synthetic baseline; real session signatures accumulate in the
  //     signatures table on top of it.
  const petitionsRows = petitionsFixture.map((p) => ({
    id: p.id,
    titleDv: p.title_dv,
    titleEn: p.title_en,
    summaryEn: p.summary_en,
    scope: p.scope,
    islandId: p.island_id,
    threshold: p.threshold,
    signatures: p.signatures,
    closesAt: p.closes_at,
    startedByDv: p.started_by_dv,
    startedByEn: p.started_by_en,
    startedAt: p.started_at,
    efaasVerifiedPct: p.efaas_verified_pct,
  }));
  const insertedPetitions = await db
    .insert(schema.petitions)
    .values(petitionsRows)
    .onConflictDoNothing()
    .returning({ id: schema.petitions.id });
  console.log(`  petitions         ${insertedPetitions.length} inserted (of ${petitionsRows.length})`);

  // --- Claims (FK threads + self-FK for nested children) ---
  const claimsRows = claimsFixture.map((c) => ({
    id: c.id,
    threadId: c.thread_id,
    parentClaimId: c.parent_claim_id,
    side: c.side,
    bodyEn: c.body_en,
    bodyDv: c.body_dv ?? null,
    authorDv: c.author_dv,
    authorEn: c.author_en,
    voteCount: c.vote_count,
    impact: c.impact,
  }));
  const insertedClaims = await db
    .insert(schema.claims)
    .values(claimsRows)
    .onConflictDoNothing()
    .returning({ id: schema.claims.id });
  console.log(`  claims            ${insertedClaims.length} inserted (of ${claimsRows.length})`);

  // --- Stub users (no FKs) ---
  const usersRows = STUB_USERS.map((u) => ({
    id: u.id,
    nameDv: u.name_dv,
    nameEn: u.name_en,
    nid: u.nid,
    islandSlug: u.island_slug,
    verifiedAt: u.verified_at,
  }));
  const insertedUsers = await db
    .insert(schema.stubUsers)
    .values(usersRows)
    .onConflictDoNothing()
    .returning({ id: schema.stubUsers.id });
  console.log(`  stub_users        ${insertedUsers.length} inserted (of ${usersRows.length})`);

  console.log("\nDone.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
