import type { BudgetLine } from "@/lib/types";

// FY26 Q1 budget lines per island. Maafaru figures from the studies-file spec;
// other islands are proportionally scaled from their FY26 totals to a common
// 4-category breakdown. Real figures will replace these once council feeds wire.

const CATEGORIES = [
  { dv: "މުވައްޒަފުންގެ މުސާރަ", en: "Staff salaries" },
  { dv: "އުމްރާނީ ތަރައްޤީ", en: "Capital works" },
  { dv: "ކަރަންޓު، ފެން", en: "Utilities" },
  { dv: "އެހެނިހެން", en: "Other" },
] as const;

interface IslandBudgetSeed {
  island_id: string;
  total: number;
  // share of total for each category (must sum to ~1)
  shares: [number, number, number, number];
  // % spent in Q1 for each category
  q1_pct: [number, number, number, number];
  // YoY change for each category
  yoy: [number, number, number, number];
}

const seeds: IslandBudgetSeed[] = [
  {
    island_id: "K-male",
    total: 510_000_000,
    shares: [0.42, 0.34, 0.16, 0.08],
    q1_pct: [25.1, 8.4, 31.2, 17.5],
    yoy: [-1.2, 22.5, 14.8, 4.0],
  },
  {
    island_id: "K-hulhumale",
    total: 84_000_000,
    shares: [0.30, 0.48, 0.14, 0.08],
    q1_pct: [24.0, 4.5, 33.0, 19.2],
    yoy: [-0.8, 38.6, 21.2, 6.5],
  },
  {
    island_id: "S-addu",
    total: 198_000_000,
    shares: [0.45, 0.31, 0.15, 0.09],
    q1_pct: [25.6, 7.1, 30.5, 18.0],
    yoy: [-1.8, 12.3, 11.4, 2.1],
  },
  {
    island_id: "HDh-kulhudhuffushi",
    total: 46_000_000,
    shares: [0.46, 0.27, 0.18, 0.09],
    q1_pct: [25.2, 9.0, 32.1, 19.5],
    yoy: [-1.0, 6.8, 16.7, 1.2],
  },
  {
    island_id: "Gn-fuvahmulah",
    total: 52_000_000,
    shares: [0.44, 0.30, 0.17, 0.09],
    q1_pct: [25.4, 8.5, 32.5, 18.5],
    yoy: [-1.3, 18.4, 19.0, 3.0],
  },
  {
    // Maafaru — figures from studies-file spec
    island_id: "N-maafaru",
    total: 12_420_000,
    shares: [0.39, 0.26, 0.07, 0.28],
    q1_pct: [24.7, 3.0, 33.9, 17.5],
    yoy: [-2.1, 44.0, 18.4, 1.8],
  },
];

export const budgetLines: BudgetLine[] = seeds.flatMap((s) =>
  CATEGORIES.map((cat, idx) => {
    const allocated = Math.round(s.total * s.shares[idx]);
    const spent = Math.round(allocated * (s.q1_pct[idx] / 100));
    return {
      island_id: s.island_id,
      fiscal_year: 2026,
      quarter: 1 as const,
      line_item_dv: cat.dv,
      line_item_en: cat.en,
      allocated_mvr: allocated,
      spent_mvr: spent,
      yoy_pct: s.yoy[idx],
    };
  })
);

// getBudgetLines moved to src/db/queries/budgets.ts. Seed-only file.
