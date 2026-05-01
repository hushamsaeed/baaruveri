import { describe, expect, it } from "vitest";
import { CACHE_HEADERS, CORS_HEADERS, buildMetadata } from "./api-helpers";

describe("buildMetadata", () => {
  it("returns the dataset, row count, and ISO timestamp", () => {
    const m = buildMetadata({ dataset: "islands", rowCount: 42 });
    expect(m.dataset).toBe("islands");
    expect(m.row_count).toBe(42);
    expect(m.generated_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("threads filter map through verbatim", () => {
    const m = buildMetadata({
      dataset: "petitions",
      rowCount: 3,
      filters: { island: "maafaru" },
    });
    expect(m.filters).toEqual({ island: "maafaru" });
  });

  it("omits filters when none provided", () => {
    const m = buildMetadata({ dataset: "islands", rowCount: 0 });
    expect(m.filters).toBeUndefined();
  });
});

describe("HTTP header constants", () => {
  it("CORS_HEADERS allows GET + OPTIONS from any origin", () => {
    expect(CORS_HEADERS["Access-Control-Allow-Origin"]).toBe("*");
    expect(CORS_HEADERS["Access-Control-Allow-Methods"]).toContain("GET");
    expect(CORS_HEADERS["Access-Control-Allow-Methods"]).toContain("OPTIONS");
  });

  it("CACHE_HEADERS sets a non-trivial cache lifetime", () => {
    expect(CACHE_HEADERS["Cache-Control"]).toMatch(/max-age=\d+/);
  });
});
