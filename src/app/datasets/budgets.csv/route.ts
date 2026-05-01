import { listBudgetLines } from "@/db/queries/budgets";
import { listIslands } from "@/db/queries/islands";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const COLUMNS = [
  "island_id",
  "island_slug",
  "island_name_en",
  "island_name_dv",
  "atoll_code",
  "fiscal_year",
  "quarter",
  "line_item_en",
  "line_item_dv",
  "allocated_mvr",
  "spent_mvr",
  "yoy_pct",
] as const;

function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  // Quote if contains comma, quote, newline, or starts/ends with whitespace
  if (/[",\n\r]/.test(s) || s !== s.trim()) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const islandFilter = searchParams.get("island");

  const [allBudgetLines, islands] = await Promise.all([
    listBudgetLines(),
    listIslands(),
  ]);
  let rows = allBudgetLines;
  let filename = "baaruveri-budgets-fy26q1.csv";
  if (islandFilter) {
    const matchingIsland = islands.find(
      (i) => i.slug === islandFilter || i.id === islandFilter
    );
    if (!matchingIsland) {
      return new Response(`Unknown island: ${islandFilter}`, {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    rows = rows.filter((r) => r.island_id === matchingIsland.id);
    filename = `baaruveri-budgets-${matchingIsland.slug}-fy26q1.csv`;
  }

  const enriched = rows.map((r) => {
    const island = islands.find((i) => i.id === r.island_id);
    return {
      island_id: r.island_id,
      island_slug: island?.slug ?? "",
      island_name_en: island?.name_en ?? "",
      island_name_dv: island?.name_dv ?? "",
      atoll_code: island?.atoll_code ?? "",
      fiscal_year: r.fiscal_year,
      quarter: r.quarter,
      line_item_en: r.line_item_en,
      line_item_dv: r.line_item_dv,
      allocated_mvr: r.allocated_mvr,
      spent_mvr: r.spent_mvr,
      yoy_pct: r.yoy_pct,
    };
  });

  const headerRow = COLUMNS.map(csvEscape).join(",");
  const dataRows = enriched.map((row) =>
    COLUMNS.map((col) => csvEscape(row[col])).join(",")
  );
  // UTF-8 BOM so Excel reads Dhivehi columns correctly
  const csvBody = "﻿" + [headerRow, ...dataRows].join("\n") + "\n";

  return new Response(csvBody, {
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=300, s-maxage=900",
    },
  });
}
