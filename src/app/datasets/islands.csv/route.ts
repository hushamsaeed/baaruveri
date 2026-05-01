import { listIslands } from "@/db/queries/islands";
import { buildCsv, csvOptions, csvResponse } from "@/lib/csv";

export const dynamic = "force-dynamic";

const COLUMNS = [
  "id",
  "slug",
  "name_en",
  "name_dv",
  "atoll_en",
  "atoll_dv",
  "atoll_code",
  "population",
  "registered_voters",
  "council_seats",
  "fy26_budget_mvr",
  "active_threads",
  "active_petitions",
  "context_en",
  "population_source_label",
  "population_source_year",
  "voters_source_label",
  "voters_source_date",
] as const;

export const OPTIONS = csvOptions;

export async function GET() {
  const islands = await listIslands();
  const rows = islands.map((i) => ({
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
    population_source_label: i.population_source.label,
    population_source_year: i.population_source.year,
    voters_source_label: i.voters_source.label,
    voters_source_date: i.voters_source.date,
  }));
  return csvResponse(buildCsv(COLUMNS, rows), "baaruveri-islands.csv");
}
