import { describe, expect, it } from "vitest";
import { buildClaimTree, subtreeDepth } from "./claim-tree";
import type { Claim } from "@/lib/types";

function c(
  id: string,
  parent: string | null,
  side: "pro" | "con",
  opts: { impact?: number; votes?: number } = {}
): Claim {
  return {
    id,
    thread_id: "thr-x",
    parent_claim_id: parent,
    side,
    body_en: id,
    author_dv: "x",
    author_en: "x",
    vote_count: opts.votes ?? 0,
    impact: opts.impact ?? 0,
  };
}

describe("buildClaimTree", () => {
  it("returns an empty map for no claims", () => {
    expect(buildClaimTree([]).size).toBe(0);
  });

  it("groups single root under null key", () => {
    const t = buildClaimTree([c("a", null, "pro")]);
    expect(t.get(null)?.map((x) => x.id)).toEqual(["a"]);
  });

  it("nests children under their parent id", () => {
    const t = buildClaimTree([
      c("a", null, "pro"),
      c("b", "a", "con"),
      c("c", "a", "pro"),
    ]);
    expect(t.get(null)?.map((x) => x.id)).toEqual(["a"]);
    const childrenOfA = t.get("a")?.map((x) => x.id) ?? [];
    expect(childrenOfA.sort()).toEqual(["b", "c"]);
  });

  it("sorts each bucket by impact desc, votes desc, id asc", () => {
    const t = buildClaimTree([
      c("low", null, "pro", { impact: 1, votes: 5 }),
      c("mid", null, "pro", { impact: 2, votes: 5 }),
      c("hi", null, "pro", { impact: 3, votes: 5 }),
      c("hi-fewer-votes", null, "pro", { impact: 3, votes: 2 }),
    ]);
    expect(t.get(null)?.map((x) => x.id)).toEqual([
      "hi",
      "hi-fewer-votes",
      "mid",
      "low",
    ]);
  });

  it("ties on impact AND votes break by id ascending", () => {
    const t = buildClaimTree([
      c("z", null, "pro", { impact: 2, votes: 3 }),
      c("a", null, "pro", { impact: 2, votes: 3 }),
      c("m", null, "pro", { impact: 2, votes: 3 }),
    ]);
    expect(t.get(null)?.map((x) => x.id)).toEqual(["a", "m", "z"]);
  });

  it("orphan with missing parent surfaces as root", () => {
    const t = buildClaimTree([
      c("a", null, "pro"),
      c("orphan", "ghost-id", "con"),
    ]);
    expect(t.get(null)?.map((x) => x.id).sort()).toEqual(["a", "orphan"]);
    expect(t.get("ghost-id")).toBeUndefined();
  });

  it("handles a 3-deep chain", () => {
    const t = buildClaimTree([
      c("root", null, "pro"),
      c("d1", "root", "con"),
      c("d2", "d1", "pro"),
      c("d3", "d2", "con"),
    ]);
    expect(t.get(null)?.[0].id).toBe("root");
    expect(t.get("root")?.[0].id).toBe("d1");
    expect(t.get("d1")?.[0].id).toBe("d2");
    expect(t.get("d2")?.[0].id).toBe("d3");
    expect(t.get("d3")).toBeUndefined();
  });
});

describe("subtreeDepth", () => {
  it("returns 0 for a leaf", () => {
    const t = buildClaimTree([c("a", null, "pro")]);
    expect(subtreeDepth(t, "a")).toBe(0);
  });

  it("counts nested chain depth", () => {
    const t = buildClaimTree([
      c("a", null, "pro"),
      c("b", "a", "con"),
      c("c", "b", "pro"),
      c("d", "c", "con"),
    ]);
    expect(subtreeDepth(t, "a")).toBe(3);
    expect(subtreeDepth(t, "b")).toBe(2);
    expect(subtreeDepth(t, "d")).toBe(0);
  });

  it("returns 0 for unknown root id", () => {
    const t = buildClaimTree([c("a", null, "pro")]);
    expect(subtreeDepth(t, "missing")).toBe(0);
  });
});
