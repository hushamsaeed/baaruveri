import { ilike, or, sql } from "drizzle-orm";
import { db } from "../index";
import {
  islands as islandsTable,
  threads as threadsTable,
  petitions as petitionsTable,
} from "../schema";
import { parseSearchQuery } from "@/lib/search";

// Postgres ILIKE across the bilingual title/body fields of each
// surface. pg_trgm + ranking is a v3.2 follow-up. For now: bounded
// sequential scan, capped at DEFAULT_LIMIT_PER_SECTION rows per type
// (overridable for the full-results /search page).

const DEFAULT_LIMIT_PER_SECTION = 5;
const MAX_LIMIT_PER_SECTION = 100;

export interface SearchHitIsland {
  kind: "island";
  id: string;
  slug: string;
  name_en: string;
  name_dv: string;
  atoll_en: string;
}
export interface SearchHitThread {
  kind: "thread";
  id: string;
  title_en: string;
  title_dv: string;
  issue: string;
}
export interface SearchHitPetition {
  kind: "petition";
  id: string;
  title_en: string;
  title_dv: string;
  scope: "island" | "national";
}
export type SearchHit = SearchHitIsland | SearchHitThread | SearchHitPetition;

export interface SearchResults {
  islands: SearchHitIsland[];
  threads: SearchHitThread[];
  petitions: SearchHitPetition[];
  totalCount: number;
}

export async function search(
  rawQuery: string,
  opts: { limitPerSection?: number } = {}
): Promise<SearchResults> {
  const q = parseSearchQuery(rawQuery);
  if (!q.isQueryable) {
    return { islands: [], threads: [], petitions: [], totalCount: 0 };
  }

  const cap = Math.max(
    1,
    Math.min(opts.limitPerSection ?? DEFAULT_LIMIT_PER_SECTION, MAX_LIMIT_PER_SECTION)
  );

  // The Drizzle `ilike()` operator is parameterised, so the escaped
  // pattern is bound — no SQL injection surface here.
  const pat = q.pattern;

  const [islandRows, threadRows, petitionRows] = await Promise.all([
    db
      .select({
        id: islandsTable.id,
        slug: islandsTable.slug,
        nameEn: islandsTable.nameEn,
        nameDv: islandsTable.nameDv,
        atollEn: islandsTable.atollEn,
      })
      .from(islandsTable)
      .where(
        or(
          ilike(islandsTable.nameEn, pat),
          ilike(islandsTable.nameDv, pat),
          ilike(islandsTable.atollEn, pat),
          ilike(islandsTable.contextEn, pat)
        )
      )
      .limit(cap),

    db
      .select({
        id: threadsTable.id,
        titleEn: threadsTable.titleEn,
        titleDv: threadsTable.titleDv,
        summaryEn: threadsTable.summaryEn,
        issue: threadsTable.issue,
      })
      .from(threadsTable)
      .where(
        or(
          ilike(threadsTable.titleEn, pat),
          ilike(threadsTable.titleDv, pat),
          ilike(threadsTable.summaryEn, pat)
        )
      )
      .orderBy(sql`${threadsTable.voteCount} desc`)
      .limit(cap),

    db
      .select({
        id: petitionsTable.id,
        titleEn: petitionsTable.titleEn,
        titleDv: petitionsTable.titleDv,
        summaryEn: petitionsTable.summaryEn,
        scope: petitionsTable.scope,
      })
      .from(petitionsTable)
      .where(
        or(
          ilike(petitionsTable.titleEn, pat),
          ilike(petitionsTable.titleDv, pat),
          ilike(petitionsTable.summaryEn, pat)
        )
      )
      .limit(cap),
  ]);

  const islands: SearchHitIsland[] = islandRows.map((r) => ({
    kind: "island",
    id: r.id,
    slug: r.slug,
    name_en: r.nameEn,
    name_dv: r.nameDv,
    atoll_en: r.atollEn,
  }));
  const threads: SearchHitThread[] = threadRows.map((r) => ({
    kind: "thread",
    id: r.id,
    title_en: r.titleEn,
    title_dv: r.titleDv,
    issue: r.issue,
  }));
  const petitions: SearchHitPetition[] = petitionRows.map((r) => ({
    kind: "petition",
    id: r.id,
    title_en: r.titleEn,
    title_dv: r.titleDv,
    scope: r.scope,
  }));

  return {
    islands,
    threads,
    petitions,
    totalCount: islands.length + threads.length + petitions.length,
  };
}
