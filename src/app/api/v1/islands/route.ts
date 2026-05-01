import { NextResponse } from "next/server";
import { listIslands } from "@/db/queries/islands";
import {
  CORS_HEADERS,
  CACHE_HEADERS,
  buildMetadata,
} from "@/lib/api-helpers";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  const islands = await listIslands();
  const data = islands.map((i) => ({
    id: i.id,
    slug: i.slug,
    name_en: i.name_en,
    name_dv: i.name_dv,
    atoll_en: i.atoll_en,
    atoll_dv: i.atoll_dv,
    atoll_code: i.atoll_code,
    population: i.population,
    registered_voters: i.registered_voters,
    council_seats: i.council_seats,
    fy26_budget_mvr: i.fy26_budget_mvr,
    active_threads: i.active_threads,
    active_petitions: i.active_petitions,
    context_en: i.context_en,
    population_source: i.population_source,
    voters_source: i.voters_source,
  }));
  return NextResponse.json(
    { metadata: buildMetadata({ dataset: "islands", rowCount: data.length }), data },
    { headers: { ...CORS_HEADERS, ...CACHE_HEADERS } }
  );
}
