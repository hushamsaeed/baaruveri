import { eq } from "drizzle-orm";
import { db } from "../index";
import { islands as islandsTable } from "../schema";
import type { Island } from "@/lib/types";

type IslandRow = typeof islandsTable.$inferSelect;

function rowToIsland(r: IslandRow): Island {
  return {
    id: r.id,
    slug: r.slug,
    name_dv: r.nameDv,
    name_en: r.nameEn,
    atoll_dv: r.atollDv,
    atoll_en: r.atollEn,
    atoll_code: r.atollCode,
    population: r.population,
    registered_voters: r.registeredVoters,
    council_seats: r.councilSeats,
    fy26_budget_mvr: r.fy26BudgetMvr,
    active_threads: r.activeThreads,
    active_petitions: r.activePetitions,
    context_en: r.contextEn,
    context_dv: r.contextDv ?? undefined,
    population_source: {
      label: r.populationSourceLabel,
      year: r.populationSourceYear,
    },
    voters_source: {
      label: r.votersSourceLabel,
      date: r.votersSourceDate,
    },
  };
}

export async function listIslands(): Promise<Island[]> {
  const rows = await db.select().from(islandsTable);
  return rows.map(rowToIsland);
}

export async function getIsland(slug: string): Promise<Island | undefined> {
  const rows = await db
    .select()
    .from(islandsTable)
    .where(eq(islandsTable.slug, slug))
    .limit(1);
  return rows[0] ? rowToIsland(rows[0]) : undefined;
}

export async function getIslandById(id: string): Promise<Island | undefined> {
  const rows = await db
    .select()
    .from(islandsTable)
    .where(eq(islandsTable.id, id))
    .limit(1);
  return rows[0] ? rowToIsland(rows[0]) : undefined;
}
