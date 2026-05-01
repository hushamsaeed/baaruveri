import { NextResponse } from "next/server";
import { listBudgetLines } from "@/db/queries/budgets";
import { listIslands } from "@/db/queries/islands";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const islandFilter = searchParams.get("island");

  const [allBudgetLines, islands] = await Promise.all([
    listBudgetLines(),
    listIslands(),
  ]);
  let rows = allBudgetLines;
  if (islandFilter) {
    const matchingIsland = islands.find(
      (i) => i.slug === islandFilter || i.id === islandFilter
    );
    if (!matchingIsland) {
      return NextResponse.json(
        { error: `Unknown island: ${islandFilter}` },
        { status: 400, headers: CORS_HEADERS }
      );
    }
    rows = rows.filter((r) => r.island_id === matchingIsland.id);
  }

  const enriched = rows.map((r) => {
    const island = islands.find((i) => i.id === r.island_id);
    return {
      island_id: r.island_id,
      island_slug: island?.slug ?? null,
      island_name_en: island?.name_en ?? null,
      island_name_dv: island?.name_dv ?? null,
      atoll_code: island?.atoll_code ?? null,
      fiscal_year: r.fiscal_year,
      quarter: r.quarter,
      line_item_en: r.line_item_en,
      line_item_dv: r.line_item_dv,
      allocated_mvr: r.allocated_mvr,
      spent_mvr: r.spent_mvr,
      yoy_pct: r.yoy_pct,
    };
  });

  const body = {
    metadata: {
      dataset: "council_budgets",
      version: "v0-prototype",
      license: "Open Database License v1.0 (ODbL) (intended for v1)",
      source: "Council quarterly returns (illustrative for the prototype)",
      generated_at: new Date().toISOString(),
      island_filter: islandFilter ?? null,
      row_count: enriched.length,
      total_islands: new Set(enriched.map((r) => r.island_id)).size,
    },
    data: enriched,
  };

  return NextResponse.json(body, {
    headers: {
      ...CORS_HEADERS,
      "Cache-Control": "public, max-age=300, s-maxage=900",
    },
  });
}
