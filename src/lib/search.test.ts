import { describe, expect, it } from "vitest";
import { escapeLikePattern, parseSearchQuery } from "./search";

describe("parseSearchQuery", () => {
  it("trims and collapses whitespace", () => {
    expect(parseSearchQuery("  maafaru   airport  ")).toEqual({
      raw: "maafaru airport",
      pattern: "%maafaru airport%",
      isQueryable: true,
    });
  });

  it("marks too-short queries as non-queryable", () => {
    expect(parseSearchQuery("a").isQueryable).toBe(false);
    expect(parseSearchQuery("").isQueryable).toBe(false);
    expect(parseSearchQuery("   ").isQueryable).toBe(false);
  });

  it("escapes LIKE wildcards in user input", () => {
    const q = parseSearchQuery("100% spent");
    expect(q.pattern).toBe("%100\\% spent%");
  });

  it("escapes underscores and backslashes", () => {
    expect(parseSearchQuery("foo_bar").pattern).toBe("%foo\\_bar%");
    expect(parseSearchQuery("a\\b").pattern).toBe("%a\\\\b%");
  });
});

describe("escapeLikePattern", () => {
  it("is a no-op for plain text", () => {
    expect(escapeLikePattern("hello world")).toBe("hello world");
  });

  it("handles all three special chars in one input", () => {
    expect(escapeLikePattern("a%b_c\\d")).toBe("a\\%b\\_c\\\\d");
  });
});
