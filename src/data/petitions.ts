import type { Petition } from "@/lib/types";

// One representative open petition per island + one national-scope petition
// (HDC arrears) that surfaces on Hulhumalé and Malé profiles by association.
// Threshold logic per project_v0_decisions.md:
//   island scope = 5% of registered voters, floor 100, ceiling 500
//   national scope = 5,000 signatures

export const petitions: Petition[] = [
  {
    id: "pet-hdc-arrears",
    title_dv: "HDC އިން ފްލެޓް ކުއްޔާއި ނުލިބޭ ފައިސާގެ ފުރިހަމަ ހިސާބު އާންމުކުރުމަށް",
    title_en:
      "HDC: publish full account of flat rents and arrears, broken down by block and allocation cohort",
    summary_en:
      "Context: MVR 728M unpaid across 60% of 8,511 flats per investigative reporting. The petition asks HDC to publish a per-block, per-cohort account, dated within the last 90 days.",
    scope: "national",
    island_id: null,
    threshold: 5000,
    signatures: 3247,
    closes_at: "2026-05-19",
    started_by_dv: "ޚަދީޖާ ނަދީމާ",
    started_by_en: "Khadheeja Nadheema",
    started_at: "2026-04-13",
    efaas_verified_pct: 82,
  },
  {
    id: "pet-male-01",
    title_dv: "ހެންވޭރު ބިމު މާކެޓުގެ ކަރުދާސް ޝައުޢީ ހާމަކުރުމަށް",
    title_en:
      "Public release of Henveiru land-allocation criteria for the FY24 cohort",
    summary_en:
      "Allocation decisions for the Henveiru cohort were made without published scoring criteria. Petition asks the Ministry to publish the criteria, scoring sheet, and full applicant list (anonymised).",
    scope: "island",
    island_id: "K-male",
    threshold: 500,
    signatures: 318,
    closes_at: "2026-05-22",
    started_by_dv: "ޢާއިޝަތު ޝިހާމް",
    started_by_en: "Aishath Shihaam",
    started_at: "2026-04-18",
    efaas_verified_pct: 91,
  },
  {
    id: "pet-hulhumale-01",
    title_dv: "ހުޅުމާލޭ ދެ ވަނަ ފޭސްގެ ފޭރާންތައް އޮޑިޓުކުރުމަށް",
    title_en:
      "Independent density and infrastructure audit of Hulhumalé Phase 2",
    summary_en:
      "An independent audit of Phase 2's actual vs designed density, with reference to the Gulhifalhu Phase 3 plan (proposed 719/ha).",
    scope: "island",
    island_id: "K-hulhumale",
    threshold: 500,
    signatures: 412,
    closes_at: "2026-05-26",
    started_by_dv: "ޢަލީ ޒާހިރު",
    started_by_en: "Ali Zaahir",
    started_at: "2026-04-22",
    efaas_verified_pct: 87,
  },
  {
    id: "pet-addu-01",
    title_dv: "ހިތަދޫ ކޯރި ހިމާޔަތުގެ EIA ކުރިން ހާމަކުރުމަށް",
    title_en:
      "Pre-disclosure of EIA for the Hithadhoo lagoon protection scheme",
    summary_en:
      "Petition asks for the EIA to be published 30 days before any approval, with public comment open for the full 30-day window.",
    scope: "island",
    island_id: "S-addu",
    threshold: 500,
    signatures: 196,
    closes_at: "2026-05-15",
    started_by_dv: "އިބްރާހީމް ނާޞިރު",
    started_by_en: "Ibrahim Naasir",
    started_at: "2026-04-15",
    efaas_verified_pct: 89,
  },
  {
    id: "pet-kulhudhuffushi-01",
    title_dv: "ކުޅި ފެހިކުރުމުގެ ޓައިމްލައިން ހާމަކުރުމަށް",
    title_en: "Disclose the mangrove restoration timeline and budget",
    summary_en:
      "The 2018 restoration commitment has not had a public timeline since 2021. Petition asks for an updated, dated plan.",
    scope: "island",
    island_id: "HDh-kulhudhuffushi",
    threshold: 355,
    signatures: 189,
    closes_at: "2026-05-12",
    started_by_dv: "ޙަސަން ޒުހައިރު",
    started_by_en: "Hassan Zuhair",
    started_at: "2026-04-12",
    efaas_verified_pct: 84,
  },
  {
    id: "pet-fuvahmulah-01",
    title_dv: "ހިމާޔަތުގެ ޚަރަދު އަވަސް ކުރުމަށް",
    title_en: "Accelerate the coastal protection capex schedule",
    summary_en:
      "Bring forward the coastal protection capex from FY28 to FY27 in light of the 3.2m southwestern retreat measured this cycle.",
    scope: "island",
    island_id: "Gn-fuvahmulah",
    threshold: 420,
    signatures: 271,
    closes_at: "2026-05-29",
    started_by_dv: "ފާޠިމަތު ޝަޒީނާ",
    started_by_en: "Fathmath Shazeena",
    started_at: "2026-04-29",
    efaas_verified_pct: 90,
  },
  {
    id: "pet-maafaru-01",
    title_dv: "މާފަރު އެއަރޕޯޓުގެ ރައްޔިތު ފައިދާގެ ހިސާބު ހާމަކުރުމަށް",
    title_en:
      "Public-benefit accounting for Maafaru International Airport (since commissioning)",
    summary_en:
      "Petition asks MIA and the Ministry of Finance to publish a year-by-year public-benefit accounting since 1 December 2019 commissioning: passenger split by type (with private-jet share), per-flight resort-transit revenue, council revenue share under the FY24 schedule, and verified employment statistics for Noonu residents. Public reporting to date covers aggregate movements (250K+ passengers, 9K+ flights through July 2025) but not per-island benefit.",
    scope: "island",
    island_id: "N-maafaru",
    threshold: 100,
    signatures: 88,
    closes_at: "2026-05-08",
    started_by_dv: "ޙަސަން މަނިކު",
    started_by_en: "Hassan Manik",
    started_at: "2026-04-08",
    efaas_verified_pct: 94,
  },
];

export function getPetitionsForIsland(islandId: string): Petition[] {
  return petitions.filter(
    (p) => p.island_id === islandId || (p.scope === "national")
  );
}

export function getPetition(id: string): Petition | undefined {
  return petitions.find((p) => p.id === id);
}
