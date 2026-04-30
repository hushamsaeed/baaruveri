import type { Claim } from "@/lib/types";

// Hero thread for v0 = Maafaru airport public-benefit accounting (thr-maafaru-01).
// Seven seeded claims (3 pro + 4 con) reflecting actual positions in the public
// debate per `reference_maldives_civic.md`. Other threads have notional claim
// counts only; their /sandbar/[id] pages render the v0-stub layout.

export const claims: Claim[] = [
  // PRO
  {
    id: "cl-maafaru-01-p1",
    thread_id: "thr-maafaru-01",
    side: "pro",
    body_en:
      "Maafaru airport opens scheduled transport for N. Atoll residents who previously needed seaplane charters at MVR 8,000+ per round-trip. Daily access for medical referrals to Malé alone justifies a meaningful share of the capital cost.",
    author_dv: "ޙުސައިން މަނިކު",
    author_en: "Hussain Manik",
    vote_count: 47,
    impact: 3.2,
  },
  {
    id: "cl-maafaru-01-p2",
    thread_id: "thr-maafaru-01",
    side: "pro",
    body_en:
      "Health emergency air-evacuation capability did not exist in N. Atoll prior to 2019. The airport has handled 36 documented medical evacuations since commissioning (MIA traffic report, 2025). That benefit accrues to residents, not tourists.",
    author_dv: "ޢާއިޝަތު ނަސްރީނާ",
    author_en: "Aishath Nasreena",
    vote_count: 31,
    impact: 2.8,
  },
  {
    id: "cl-maafaru-01-p3",
    thread_id: "thr-maafaru-01",
    side: "pro",
    body_en:
      "Strategic infrastructure value compounds. The airport unlocked Soneva Jani's Phase 2 and the Velaa expansion; bed-night tax from those properties flows to the atoll council under the FY24 revenue-sharing schedule.",
    author_dv: "އިބްރާހީމް ޝިހާމް",
    author_en: "Ibrahim Shihaam",
    vote_count: 22,
    impact: 2.4,
  },

  // CON
  {
    id: "cl-maafaru-01-c1",
    thread_id: "thr-maafaru-01",
    side: "con",
    body_en:
      "MVR 600M+ public investment delivered an airport used 80%+ for tourist transit. The benefit is captured by resort operators, not residents. Per-capita, this is the largest public infrastructure spend in the country with the smallest direct resident return.",
    author_dv: "ފާޠިމަތު ސަޢީދު",
    author_en: "Fathmath Saeed",
    vote_count: 89,
    impact: 3.7,
  },
  {
    id: "cl-maafaru-01-c2",
    thread_id: "thr-maafaru-01",
    side: "con",
    body_en:
      "Public-benefit accounting has not been published since commissioning in 2019. There is no per-year breakdown of resident vs tourist usage in the public domain. Without that ledger, every defence of the project is unfalsifiable.",
    body_dv:
      "އެއަރޕޯޓުގެ ފައިދާ ހިސާބު 2019 ވަނަ އަހަރުން ފެށިގެން އާންމުކޮށްފައެއް ނެތް.",
    author_dv: "ޚަދީޖާ ނަދީމާ",
    author_en: "Khadheeja Nadheema",
    vote_count: 64,
    impact: 3.5,
  },
  {
    id: "cl-maafaru-01-c3",
    thread_id: "thr-maafaru-01",
    side: "con",
    body_en:
      "Operational subsidy from MOFT continues. The airport has not reached cost-recovery as projected in the original feasibility study (2017). Annual subsidy in FY24 was MVR 14M — a recurring cost on top of the capital outlay.",
    author_dv: "އަޙްމަދު ނާޒިމް",
    author_en: "Ahmed Naazim",
    vote_count: 38,
    impact: 3.0,
  },
  {
    id: "cl-maafaru-01-c4",
    thread_id: "thr-maafaru-01",
    side: "con",
    body_en:
      "Comparable per-capita investment in education or healthcare infrastructure for Noonu would have served residents directly. The opportunity cost is the harder question this thread keeps asking the airport's defenders to answer with numbers, not strategy talk.",
    author_dv: "މަރްޔަމް ވަޙީދާ",
    author_en: "Mariyam Waheedha",
    vote_count: 27,
    impact: 2.6,
  },
];

export function getClaimsForThread(threadId: string): Claim[] {
  return claims.filter((c) => c.thread_id === threadId);
}

export const HERO_THREAD_ID = "thr-maafaru-01";
