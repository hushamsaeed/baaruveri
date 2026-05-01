import { describe, expect, it } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  it("admits the first call and decrements remaining", () => {
    const r = rateLimit("k1-test-admits", 3, 60_000);
    expect(r.ok).toBe(true);
    expect(r.remaining).toBe(2);
  });

  it("blocks once the limit is exhausted within the window", () => {
    const key = "k2-test-blocks";
    expect(rateLimit(key, 2, 60_000).ok).toBe(true);
    expect(rateLimit(key, 2, 60_000).ok).toBe(true);
    const denied = rateLimit(key, 2, 60_000);
    expect(denied.ok).toBe(false);
    expect(denied.remaining).toBe(0);
  });

  it("admits again after the window resets", async () => {
    const key = "k3-test-resets";
    expect(rateLimit(key, 1, 30).ok).toBe(true);
    expect(rateLimit(key, 1, 30).ok).toBe(false);
    await new Promise((r) => setTimeout(r, 40));
    expect(rateLimit(key, 1, 30).ok).toBe(true);
  });

  it("scopes counts per-key", () => {
    expect(rateLimit("k4-a", 1, 60_000).ok).toBe(true);
    expect(rateLimit("k4-b", 1, 60_000).ok).toBe(true);
    expect(rateLimit("k4-a", 1, 60_000).ok).toBe(false);
    expect(rateLimit("k4-b", 1, 60_000).ok).toBe(false);
  });
});
