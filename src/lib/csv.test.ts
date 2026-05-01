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

  it("prefixes formula-leading cells to neutralise CSV injection", () => {
    // OWASP-class formula injection: cells starting with =, +, -, @, \t,
    // \r are interpreted as formulas by spreadsheet apps. Each must be
    // prefixed with a leading apostrophe.
    const csv = buildCsv(["x"], [
      { x: "=HYPERLINK(\"http://evil\",\"click\")" },
      { x: "+1+1" },
      { x: "-2+5" },
      { x: "@SUM(A1)" },
      { x: "\tinjected" },
    ]);
    expect(csv).toContain("\"'=HYPERLINK(\"\"http://evil\"\",\"\"click\"\")\"");
    expect(csv).toContain("'+1+1");
    expect(csv).toContain("'-2+5");
    expect(csv).toContain("'@SUM(A1)");
    // The tab-prefixed cell still gets the apostrophe; the resulting
    // string then contains a tab so it is also wrapped in quotes by the
    // existing trim/control-char rule.
    expect(csv).toMatch(/'\tinjected/);
  });

  it("leaves benign cells unprefixed", () => {
    const csv = buildCsv(["x"], [
      { x: "Maafaru airport" },
      { x: "100% spent" },
      { x: "5.5km" },
    ]);
    expect(csv).toContain("Maafaru airport");
    expect(csv).toContain("100% spent");
    expect(csv).toContain("5.5km");
    expect(csv).not.toContain("'Maafaru");
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
