// Search query parser. Trims, collapses whitespace, and returns both
// the original (used as the bound argument to similarity() for pg_trgm
// ranking) and a LIKE-escaped pattern (used as the WHERE filter via
// ILIKE). The actual SQL is in db/queries/search.ts.

export interface ParsedSearchQuery {
  raw: string;
  // The %-padded escaped pattern ready for an ILIKE call. Empty for
  // queries that are too short to be useful.
  pattern: string;
  // True if the query is long enough to query the DB. We cap at 1 char
  // because anything shorter spams the network.
  isQueryable: boolean;
}

const MIN_QUERY_LENGTH = 2;

export function parseSearchQuery(input: string): ParsedSearchQuery {
  const raw = input.trim().replace(/\s+/g, " ");
  if (raw.length < MIN_QUERY_LENGTH) {
    return { raw, pattern: "", isQueryable: false };
  }
  return { raw, pattern: `%${escapeLikePattern(raw)}%`, isQueryable: true };
}

// Escape Postgres LIKE wildcard chars so user input "100%" doesn't match
// everything. Backslash escape is documented behavior of LIKE in
// Postgres when ESCAPE is unspecified (defaults to backslash).
export function escapeLikePattern(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}
