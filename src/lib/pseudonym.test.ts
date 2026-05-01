import { describe, expect, it } from "vitest";
import { pseudonymFor } from "./pseudonym";

describe("pseudonymFor", () => {
  it("is deterministic for the same (anonId, threadId)", () => {
    const a = pseudonymFor("abc123", "thread-foo");
    const b = pseudonymFor("abc123", "thread-foo");
    expect(a).toBe(b);
  });

  it("yields different pseudonyms for the same anon across threads", () => {
    const a = pseudonymFor("abc123", "thread-foo");
    const b = pseudonymFor("abc123", "thread-bar");
    expect(a).not.toBe(b);
  });

  it("matches the adjective-noun-NN format", () => {
    const p = pseudonymFor("abc123", "thread-foo");
    expect(p).toMatch(/^[a-z]+-[a-z]+-\d{2}$/);
  });

  it("never emits suffix '00' (deliberately reserved)", () => {
    for (let i = 0; i < 200; i++) {
      const p = pseudonymFor(`anon-${i}`, "thread-x");
      const suffix = p.split("-").at(-1);
      expect(suffix).not.toBe("00");
    }
  });
});
