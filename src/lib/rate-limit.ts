// Per-key sliding-window rate limiter, in-memory. Single Next.js
// process is the deploy unit on Dokploy, so a Map<string, …> is the
// right shape; multi-instance horizontal scaling would need a Postgres
// or Redis-backed counter.
//
// Reset on container restart is acceptable for v0 — restarts are rare
// and the surface this protects (anon-tier comment / claim / vote /
// signature spam) doesn't survive across deploys anyway. Documented
// explicitly so a future scale-out doesn't silently drop the cap.

interface Bucket {
  count: number;
  resetAt: number; // ms epoch
}

// Hard cap on map size so a flood of unique keys can't exhaust memory.
// LRU-ish: when full, drop expired entries first; if still full, drop
// the oldest. 10k keys × ~100 bytes ≈ 1MB ceiling.
const MAX_KEYS = 10_000;

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check if `key` is under the limit, and if so consume one slot.
 * Returns ok=false when the bucket is exhausted; the caller should
 * surface a friendly error and NOT proceed with the action.
 *
 * Window is a fixed-rolling bucket: first call mints the bucket with
 * resetAt = now + windowMs; subsequent calls within the window count
 * against it; the bucket is replaced once `now > resetAt`.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    if (buckets.size >= MAX_KEYS) evictExpired(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
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
  for (const [k, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(k);
  }
  // If still over after expiry purge, drop the 10% oldest by resetAt.
  if (buckets.size >= MAX_KEYS) {
    const sorted = [...buckets.entries()].sort(
      (a, b) => a[1].resetAt - b[1].resetAt
    );
    const toDrop = Math.ceil(buckets.size * 0.1);
    for (let i = 0; i < toDrop; i++) buckets.delete(sorted[i]![0]);
  }
}
