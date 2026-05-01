import type { Thread } from "@/lib/types";

// One representative active thread per island for v0. Issue tags drawn from
// the seven canonical issue taxonomies. These seed Sandbar; the profile page
// surfaces the per-island ones in the threads list.

export const threads: Thread[] = [
  {
    id: "thr-male-01",
    issue: "housing",
    island_id: "K-male",
    title_dv: "ހެންވޭރު ދެކުނުގެ ޕާކިންގ ބިން މިހާރުގެ ހާލަތު",
    title_en: "Henveiru Dhekunu parking saturation: current state",
    summary_en:
      "Galolhu and Henveiru wards routinely report parking ratios above 1.6 vehicles per dedicated bay. What does the council's enforcement plan look like for FY26?",
    started_by_dv: "ފާޠިމަތު ނަސީމާ",
    started_by_en: "Fathmath Naseema",
    started_at: "2026-04-22",
    reply_count: 67,
    claim_count: 12,
    vote_count: 488,
  },
  {
    id: "thr-hulhumale-01",
    issue: "housing",
    island_id: "K-hulhumale",
    title_dv: "ހުޅުމާލޭ ދެ ވަނަ ފޭސްގައި 550 މީހުން/ހެކްޓަރ — ޑިޒައިން 329",
    title_en: "Hulhumalé Phase 2 density: 550 ppl/ha vs design 329",
    summary_en:
      "Phase 2 density now 550 people per hectare against the design target of 329. What does HDC's response look like, and is there any relief plan in motion?",
    started_by_dv: "ޢަލީ ޒާހިރު",
    started_by_en: "Ali Zaahir",
    started_at: "2026-04-27",
    reply_count: 42,
    claim_count: 8,
    vote_count: 312,
  },
  {
    id: "thr-addu-01",
    issue: "climate",
    island_id: "S-addu",
    title_dv: "ހިތަދޫ ކޯރި ހިމާޔަތްކުރުމާ މެދު ގޮތެއް ނިންމާ",
    title_en: "Hithadhoo lagoon protection — what's the plan?",
    summary_en:
      "Equator Village expansion EIA flagged a >40% lagoon-area impact. Council position and proposed mitigations.",
    started_by_dv: "އިބްރާހީމް ނާއިލް",
    started_by_en: "Ibrahim Naail",
    started_at: "2026-04-19",
    reply_count: 31,
    claim_count: 7,
    vote_count: 264,
  },
  {
    id: "thr-kulhudhuffushi-01",
    issue: "climate",
    island_id: "HDh-kulhudhuffushi",
    title_dv: "2018 ކުޅި ގެއްލުމުގެ ބަދަލުގައި ވެފައިވާ ވަޢުދު",
    title_en: "2018 mangrove loss — what came of the restoration commitment?",
    summary_en:
      "After the 2018 reclamation that filled approximately 70% of the mangrove kulhi for the airport, the restoration plan was promised. Where does it stand?",
    started_by_dv: "ޙަސަން ޒުހައިރު",
    started_by_en: "Hassan Zuhair",
    started_at: "2026-04-12",
    reply_count: 28,
    claim_count: 5,
    vote_count: 219,
  },
  {
    id: "thr-fuvahmulah-01",
    issue: "climate",
    island_id: "Gn-fuvahmulah",
    title_dv: "ދެކުނު ހުޅަނގު އައްސޭރީގެ ކޯމަށް ވުމުގެ ހާލަތު",
    title_en: "Southwestern shoreline erosion: latest measurements",
    summary_en:
      "MEE survey reports >3.2m of shoreline retreat at the southwestern point over 18 months. Coastal protection capex schedule and which berm design is in scope.",
    started_by_dv: "ފާޠިމަތު ޝަޒީނާ",
    started_by_en: "Fathmath Shazeena",
    started_at: "2026-04-15",
    reply_count: 24,
    claim_count: 4,
    vote_count: 192,
  },
  {
    id: "thr-maafaru-01",
    issue: "procurement",
    island_id: "N-maafaru",
    title_dv: "މާފަރު އިންޓަރނޭޝަނަލް އެއަރޕޯޓު — ރައްޔިތުންނަށް ވާ ފައިދާ",
    title_en: "Maafaru International Airport — what does the public benefit ledger say?",
    summary_en:
      "Opened 1 December 2019. Funded by an Abu Dhabi Fund for Development grant of USD 60M+, with ADFD reporting USD 76M+ across two phases. The airport is now positioned as the country's private-jet hub — 804 private-jet movements in 2025, up 38% year on year. What share of the resulting bed-night and arrival revenue routes back to Noonu Atoll councils, and is there a published benefit-sharing schedule on file?",
    started_by_dv: "އިބްރާހީމް ޝިހާމް",
    started_by_en: "Ibrahim Shihaam",
    started_at: "2026-04-08",
    reply_count: 56,
    claim_count: 18,
    vote_count: 421,
  },
];

// getThreadsForIsland moved to src/db/queries/threads.ts. Seed-only file.
