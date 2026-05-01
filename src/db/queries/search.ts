import { ilike, or, sql } from "drizzle-orm";
import { db } from "../index";
import {
  islands as islandsTable,
  threads as threadsTable,
  petitions as petitionsTable,
} from "../schema";
import { parseSearchQuery } from "@/lib/search";

// Postgres ILIKE matches the WHERE filter; pg_trgm similarity() drives
// the ORDER BY so the closest title match surfaces above incidental
// summary/context hits. The 0003 migration creates the gin_trgm_ops
// indexes the similarity expressions read from. Capped at
// DEFAULT_LIMIT_PER_SECTION rows per type (overridable for the
// full-results /search page).

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
  // pattern is bound — no SQL injection surface here. The similarity()
  // expressions bind q.raw the same way (drizzle's sql tag treats raw
  // values as parameters, not interpolated strings).
  const pat = q.pattern;
  const raw = q.raw;

  // GREATEST() across the title/name fields. Threads and petitions
  // weight the title 0.6× over the summary so an exact title match wins
  // even when the summary contains the term verbatim. Vote count is the
  // tiebreaker for threads — preserves the prior secondary signal.
  const islandRank = sql<number>`GREATEST(
    similarity(${islandsTable.nameEn}, ${raw}),
    similarity(${islandsTable.nameDv}, ${raw}),
    similarity(${islandsTable.atollEn}, ${raw}),
    similarity(${islandsTable.contextEn}, ${raw}) * 0.6
  )`;
  const threadRank = sql<number>`GREATEST(
    similarity(${threadsTable.titleEn}, ${raw}),
    similarity(${threadsTable.titleDv}, ${raw}),
    similarity(${threadsTable.summaryEn}, ${raw}) * 0.6
  )`;
  const petitionRank = sql<number>`GREATEST(
    similarity(${petitionsTable.titleEn}, ${raw}),
    similarity(${petitionsTable.titleDv}, ${raw}),
    similarity(${petitionsTable.summaryEn}, ${raw}) * 0.6
  )`;

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
      .orderBy(sql`${islandRank} DESC`)
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
      .orderBy(sql`${threadRank} DESC, ${threadsTable.voteCount} DESC`)
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
      .orderBy(sql`${petitionRank} DESC`)
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
