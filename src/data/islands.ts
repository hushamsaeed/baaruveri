import type { Island } from "@/lib/types";

// v0 fixture — 6 representative islands per project_v0_decisions.md.
// Population figures are NBS-aligned approximations; voters drawn from
// Elections Commission registers around the 4 Apr 2026 local election.
// Budgets are illustrative for the prototype until real council data is wired.

export const islands: Island[] = [
  {
    id: "K-male",
    slug: "male",
    name_dv: "މާލެ",
    name_en: "Malé",
    atoll_dv: "ކ.",
    atoll_en: "Kaafu",
    atoll_code: "K",
    population: 152_000,
    registered_voters: 96_400,
    council_seats: 19,
    fy26_budget_mvr: 510_000_000,
    active_threads: 87,
    active_petitions: 6,
    context_en:
      "Capital island and the country's densest urban core (≈65,000/km²). Housing pressure, parking gridlock, and harbour-front land-use decisions dominate local civic debate.",
    population_source: { label: "NBS census", year: 2024 },
    voters_source: { label: "Elections Commission register", date: "2026-04-04" },
  },
  {
    id: "K-hulhumale",
    slug: "hulhumale",
    name_dv: "ހުޅުމާލެ",
    name_en: "Hulhumalé",
    atoll_dv: "ކ.",
    atoll_en: "Kaafu",
    atoll_code: "K",
    population: 60_400,
    registered_voters: 38_200,
    council_seats: 0,
    fy26_budget_mvr: 84_000_000,
    active_threads: 64,
    active_petitions: 4,
    context_en:
      "Reclaimed island administered by HDC. Phase 2 density currently 550 ppl/hectare against a design target of 329; Gulhifalhu Phase 3 plan proposes 719/hectare. Most-watched housing site in the country.",
    population_source: { label: "HDC + NBS estimate", year: 2024 },
    voters_source: { label: "Elections Commission register", date: "2026-04-04" },
  },
  {
    id: "S-addu",
    slug: "addu-city",
    name_dv: "އައްޑޫ ސިޓީ",
    name_en: "Addu City",
    atoll_dv: "ސ.",
    atoll_en: "Seenu",
    atoll_code: "S",
    population: 33_500,
    registered_voters: 22_900,
    council_seats: 13,
    fy26_budget_mvr: 198_000_000,
    active_threads: 38,
    active_petitions: 3,
    context_en:
      "Southernmost city, spanning seven islands with a causeway link. Tourism (Equator Village, Shangri-La) and airport expansion compete with reef and lagoon protection in the active threads.",
    population_source: { label: "NBS census", year: 2024 },
    voters_source: { label: "Elections Commission register", date: "2026-04-04" },
  },
  {
    id: "HDh-kulhudhuffushi",
    slug: "kulhudhuffushi",
    name_dv: "ކުޅުދުއްފުށި",
    name_en: "Kulhudhuffushi",
    atoll_dv: "ހ.ދ.",
    atoll_en: "Haa Dhaalu",
    atoll_code: "HDh",
    population: 10_500,
    registered_voters: 7_100,
    council_seats: 7,
    fy26_budget_mvr: 46_000_000,
    active_threads: 22,
    active_petitions: 2,
    context_en:
      "Northern regional hub. The 2018 mangrove reclamation for the airport remains a live restoration debate; ferry-network reliability is a recurring thread.",
    population_source: { label: "NBS census", year: 2024 },
    voters_source: { label: "Elections Commission register", date: "2026-04-04" },
  },
  {
    id: "Gn-fuvahmulah",
    slug: "fuvahmulah",
    name_dv: "ފުވައްމުލައް",
    name_en: "Fuvahmulah",
    atoll_dv: "ޏ.",
    atoll_en: "Gnaviyani",
    atoll_code: "Gn",
    population: 12_300,
    registered_voters: 8_400,
    council_seats: 7,
    fy26_budget_mvr: 52_000_000,
    active_threads: 19,
    active_petitions: 2,
    context_en:
      "Single-island atoll with two protected freshwater lakes and a globally known tiger-shark dive site. Climate vulnerability — coastal erosion, freshwater lens stress — drives most of the civic conversation.",
    population_source: { label: "NBS census", year: 2024 },
    voters_source: { label: "Elections Commission register", date: "2026-04-04" },
  },
  {
    id: "N-maafaru",
    slug: "maafaru",
    name_dv: "މާފަރު",
    name_en: "Maafaru",
    atoll_dv: "ނ.",
    atoll_en: "Noonu",
    atoll_code: "N",
    population: 711,
    registered_voters: 483,
    council_seats: 5,
    fy26_budget_mvr: 12_420_000,
    active_threads: 14,
    active_petitions: 2,
    context_en:
      "Small Noonu island. Maafaru International Airport (2019) was built with MVR 600M+ public investment; ongoing public scrutiny of its predominantly tourist-transit use vs. resident benefit.",
    population_source: { label: "NBS census", year: 2024 },
    voters_source: { label: "Elections Commission register", date: "2026-04-04" },
  },
];

export function getIsland(slug: string): Island | undefined {
  return islands.find((i) => i.slug === slug);
}
