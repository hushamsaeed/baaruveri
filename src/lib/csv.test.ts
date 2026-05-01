import { describe, expect, it } from "vitest";
import { buildCsv, csvOptions, csvResponse } from "./csv";

describe("buildCsv", () => {
  it("emits a UTF-8 BOM as the very first byte", () => {
    const csv = buildCsv(["a"], [{ a: "1" }]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });

  it("quotes cells containing commas, quotes, or newlines", () => {
    const csv = buildCsv(["x"], [
      { x: "has, comma" },
      { x: 'has "quote"' },
      { x: "has\nnewline" },
    ]);
    expect(csv).toContain('"has, comma"');
    expect(csv).toContain('"has ""quote"""');
    expect(csv).toContain('"has\nnewline"');
  });

  it("handles bilingual Dhivehi cells without mangling", () => {
    const csv = buildCsv(["en", "dv"], [
      { en: "Maafaru airport", dv: "މާފަރު އެއާޕޯޓު" },
    ]);
    expect(csv).toContain("Maafaru airport");
    expect(csv).toContain("މާފަރު އެއާޕޯޓު");
  });

  it("renders missing/null values as empty cells", () => {
    const csv = buildCsv(["a", "b"], [{ a: "x", b: null }, { a: "y" }]);
    const lines = csv.split("\n").filter(Boolean);
    expect(lines[1]).toBe("x,");
    expect(lines[2]).toBe("y,");
  });

  it("includes header row even with no data", () => {
    const csv = buildCsv(["a", "b", "c"], []);
    expect(csv).toBe("﻿a,b,c\n");
  });
});

describe("csvResponse", () => {
  it("sets attachment disposition with the given filename", () => {
    const r = csvResponse("a,b\n1,2\n", "test.csv");
    expect(r.headers.get("Content-Disposition")).toBe(
      'attachment; filename="test.csv"'
    );
    expect(r.headers.get("Content-Type")).toBe("text/csv; charset=utf-8");
  });
});

describe("csvOptions", () => {
  it("returns 204 with CORS headers for preflight", () => {
    const r = csvOptions();
    expect(r.status).toBe(204);
    expect(r.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });
});
