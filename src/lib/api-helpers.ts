import { NextResponse } from "next/server";

// Shared helpers for /api/v1/* JSON route handlers.

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

// Long cache for static-ish read-only datasets (islands, council, budgets).
export const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=300, s-maxage=900",
} as const;

// Short cache for endpoints whose counts mutate via Server Actions
// (petitions signature totals, threads vote/reply counts, claims vote
// counts). 60s s-maxage keeps the API in sync with the UI's live signal
// without hammering the DB on burst traffic.
export const COUNTER_CACHE_HEADERS = {
  "Cache-Control": "public, max-age=30, s-maxage=60",
} as const;

const API_VERSION = "v0-prototype";
const API_LICENSE = "Open Database License v1.0 (ODbL) (intended for v1)";
const API_SOURCE_NOTE =
  "Concept prototype seed data; replaces with live council / EC / NBS feeds in v2.x";

export interface ApiMetadata {
  dataset: string;
  version: string;
  license: string;
  source: string;
  generated_at: string;
  row_count: number;
  filters?: Record<string, string | null>;
}

export function buildMetadata(opts: {
  dataset: string;
  rowCount: number;
  filters?: Record<string, string | null>;
}): ApiMetadata {
  return {
    dataset: opts.dataset,
    version: API_VERSION,
    license: API_LICENSE,
    source: API_SOURCE_NOTE,
    generated_at: new Date().toISOString(),
    row_count: opts.rowCount,
    filters: opts.filters,
  };
}

/** Single shape for `{ error: string }` responses across all routes.
 * Always emits CORS headers so clients see the body cleanly. */
export function apiError(message: string, status = 400): NextResponse {
  return NextResponse.json(
    { error: message },
    { status, headers: CORS_HEADERS }
  );
}
