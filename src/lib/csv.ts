// CSV building shared by /datasets/*.csv route handlers.
// UTF-8 BOM so Excel renders Dhivehi cells correctly. Quotes any cell that
// contains comma / quote / newline / leading-trailing whitespace.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
} as const;

// Cells whose first character is one of these are interpreted as a
// formula by Excel / LibreOffice on open and would execute on the
// downloader's machine. Prefix with a single quote to neutralise. Per
// the OWASP CSV-injection guidance.
const FORMULA_INJECTION_PREFIXES = /^[=+\-@\t\r]/;

function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  let s = String(value);
  if (FORMULA_INJECTION_PREFIXES.test(s)) {
    s = `'${s}`;
  }
  if (/[",\n\r]/.test(s) || s !== s.trim()) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function buildCsv(
  headers: readonly string[],
  rows: readonly Record<string, string | number | null | undefined>[]
): string {
  const headerRow = headers.map(csvEscape).join(",");
  const dataRows = rows.map((row) =>
    headers.map((h) => csvEscape(row[h])).join(",")
  );
  // Leading U+FEFF BOM so spreadsheet apps detect UTF-8.
  return "﻿" + [headerRow, ...dataRows].join("\n") + "\n";
}

export function csvResponse(body: string, filename: string): Response {
  return new Response(body, {
    headers: {
      ...CORS,
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=300, s-maxage=900",
    },
  });
}

export function csvOptions(): Response {
  return new Response(null, { status: 204, headers: CORS });
}
