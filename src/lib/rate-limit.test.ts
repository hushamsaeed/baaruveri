import { describe, expect, it } from "vitest";
import { rateLimitInMemory } from "./rate-limit";

// Tests target rateLimitInMemory directly so the bucket logic is
// covered without a live DB. The Postgres path uses the same window/
// increment/reset semantics translated to a single ON CONFLICT upsert
// (see lib/rate-limit.ts).
describe("rateLimitInMemory", () => {
  it("admits the first call and decrements remaining", () => {
    const r = rateLimitInMemory("k1-test-admits", 3, 60_000);
    expect(r.ok).toBe(true);
    expect(r.remaining).toBe(2);
  });

  it("blocks once the limit is exhausted within the window", () => {
    const key = "k2-test-blocks";
    expect(rateLimitInMemory(key, 2, 60_000).ok).toBe(true);
    expect(rateLimitInMemory(key, 2, 60_000).ok).toBe(true);
    const denied = rateLimitInMemory(key, 2, 60_000);
    expect(denied.ok).toBe(false);
    expect(denied.remaining).toBe(0);
  });

  it("admits again after the window resets", async () => {
    const key = "k3-test-resets";
    expect(rateLimitInMemory(key, 1, 30).ok).toBe(true);
    expect(rateLimitInMemory(key, 1, 30).ok).toBe(false);
    await new Promise((r) => setTimeout(r, 40));
    expect(rateLimitInMemory(key, 1, 30).ok).toBe(true);
  });

  it("scopes counts per-key", () => {
    expect(rateLimitInMemory("k4-a", 1, 60_000).ok).toBe(true);
    expect(rateLimitInMemory("k4-b", 1, 60_000).ok).toBe(true);
    expect(rateLimitInMemory("k4-a", 1, 60_000).ok).toBe(false);
    expect(rateLimitInMemory("k4-b", 1, 60_000).ok).toBe(false);
  });
});
