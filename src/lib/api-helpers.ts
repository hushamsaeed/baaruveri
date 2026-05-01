// Shared helpers for /api/v1/* JSON route handlers.

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

export const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=300, s-maxage=900",
} as const;

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
    version: "v0-prototype",
    license: "Open Database License v1.0 (ODbL) (intended for v1)",
    source:
      "Concept prototype seed data; replaces with live council / EC / NBS feeds in v2.x",
    generated_at: new Date().toISOString(),
    row_count: opts.rowCount,
    filters: opts.filters,
  };
}
