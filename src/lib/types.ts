// Shared types for Baaruveri v0. These will move to Drizzle schema later;
// for now they document the shape that fixtures + components agree on.

export type IssueTag =
  | "housing"
  | "judiciary"
  | "climate"
  | "fisheries"
  | "education"
  | "decentralisation"
  | "procurement";

export interface Island {
  id: string;
  slug: string;
  name_dv: string;
  name_en: string;
  atoll_dv: string;
  atoll_en: string;
  atoll_code: string;            // single-letter administrative code, e.g. "N" for Noonu
  population: number;
  registered_voters: number;
  council_seats: number;
  fy26_budget_mvr: number;
  active_threads: number;
  active_petitions: number;
  context_en: string;            // 1-2 sentence editorial context
  context_dv?: string;
  population_source: { label: string; year: number };
  voters_source: { label: string; date: string };
}

export interface Thread {
  id: string;
  issue: IssueTag;
  island_id: string | null;       // null = national-level
  title_dv: string;
  title_en: string;
  summary_en: string;
  started_by_dv: string;
  started_by_en: string;
  started_at: string;             // ISO date
  reply_count: number;
  claim_count: number;
  vote_count: number;
}

export interface Claim {
  id: string;
  thread_id: string;
  side: "pro" | "con";
  body_en: string;
  body_dv?: string;
  author_dv: string;
  author_en: string;
  vote_count: number;
  impact: number;                 // 0-4
}

export interface Petition {
  id: string;
  title_dv: string;
  title_en: string;
  summary_en: string;
  scope: "island" | "national";
  island_id: string | null;
  threshold: number;              // signatures required
  signatures: number;
  closes_at: string;              // ISO date
  started_by_dv: string;
  started_by_en: string;
  started_at: string;
  efaas_verified_pct: number;     // 0-100
}

export interface BudgetLine {
  island_id: string;
  fiscal_year: number;
  quarter: 1 | 2 | 3 | 4;
  line_item_dv: string;
  line_item_en: string;
  allocated_mvr: number;
  spent_mvr: number;
  yoy_pct: number;
}

export interface CouncilMember {
  id: string;
  island_id: string;
  name_dv: string;
  name_en: string;
  role_en: "Chair" | "Vice-Chair" | "Member";
  role_dv: string;
  party: string;                  // "MDP" | "PNC" | "PPM" | "Independent" | "JP" | "TPM"
  ward_en?: string;               // for city councils
  elected_at: string;             // ISO date
}
