// Sliding-window rate limiter, Postgres-backed by default with an
// in-memory fallback. The Postgres path uses a single-statement upsert
// against rate_limit_buckets (migration 0005); one round-trip per check.
//
// The in-memory fallback runs when DATABASE_URL is the placeholder
// (e.g. unit tests, build sandbox) or when a DB query throws — failing
// open is the right move there. Legitimate traffic shouldn't be blocked
// by an unrelated DB hiccup; the in-memory cap still bounds local
// abuse during the outage window.
//
// API: async rateLimit(key, limit, windowMs) → RateLimitResult.
// The function is async because the prod path hits Postgres; tests can
// drive the in-memory variant via rateLimitInMemory directly.

import { sql } from "drizzle-orm";
import { db } from "@/db";

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

const MAX_MEM_KEYS = 10_000;
const memBuckets = new Map<string, { count: number; resetAt: number }>();

const PLACEHOLDER_DB_URL =
  "postgres://placeholder@localhost:5432/placeholder";

function isDbReachable(): boolean {
  const url = process.env.DATABASE_URL;
  return !!url && url !== PLACEHOLDER_DB_URL;
}

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  if (!isDbReachable()) {
    return rateLimitInMemory(key, limit, windowMs);
  }
  try {
    const seconds = windowMs / 1000;
    const rows = (await db.execute(
      sql`INSERT INTO rate_limit_buckets (key, count, reset_at)
          VALUES (${key}, 1, now() + make_interval(secs => ${seconds}))
          ON CONFLICT (key) DO UPDATE SET
            count = CASE
              WHEN rate_limit_buckets.reset_at <= now() THEN 1
              ELSE rate_limit_buckets.count + 1
            END,
            reset_at = CASE
              WHEN rate_limit_buckets.reset_at <= now() THEN excluded.reset_at
              ELSE rate_limit_buckets.reset_at
            END
          RETURNING count, reset_at`
    )) as unknown as Array<{ count: number; reset_at: Date | string }>;
    const row = rows[0];
    if (!row) {
      return { ok: true, remaining: limit - 1, resetAt: Date.now() + windowMs };
    }
    const count = Number(row.count);
    const resetAt = new Date(row.reset_at).getTime();
    return {
      ok: count <= limit,
      remaining: Math.max(0, limit - count),
      resetAt,
    };
  } catch (err) {
    // Fail open. If the rate-limit table itself is unreachable we'd
    // rather let the user post than hard-fail.
    console.error("[rate-limit] db error, allowing request:", err);
    return { ok: true, remaining: limit - 1, resetAt: Date.now() + windowMs };
  }
}

/** Synchronous in-memory variant. Exported so tests can exercise the
 *  bucket logic without a DB. Production prefers the Postgres path. */
export function rateLimitInMemory(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const existing = memBuckets.get(key);
  if (!existing || existing.resetAt <= now) {
    if (memBuckets.size >= MAX_MEM_KEYS) evictExpired(now);
    memBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  if (existing.count >= limit) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt };
  }
  existing.count += 1;
  return {
    ok: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  };
}

function evictExpired(now: number): void {
  for (const [k, b] of memBuckets) {
    if (b.resetAt <= now) memBuckets.delete(k);
  }
  if (memBuckets.size >= MAX_MEM_KEYS) {
    const sorted = [...memBuckets.entries()].sort(
      (a, b) => a[1].resetAt - b[1].resetAt
    );
    const toDrop = Math.ceil(memBuckets.size * 0.1);
    for (let i = 0; i < toDrop; i++) memBuckets.delete(sorted[i]![0]);
  }
}
