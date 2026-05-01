// CSV building shared by /datasets/*.csv route handlers.
// UTF-8 BOM so Excel renders Dhivehi cells correctly. Quotes any cell that
// contains comma / quote / newline / leading-trailing whitespace.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
} as const;

function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
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
