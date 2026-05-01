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
    parent_claim_id: null,
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
    parent_claim_id: null,
    side: "pro",
    body_en:
      "Health emergency air-evacuation capability did not exist in N. Atoll prior to commissioning. Documented evacuations have been handled out of Maafaru since 2019; the precise figure should be in the petition the council is asking for. Whatever that number turns out to be, the benefit accrues to residents, not tourists.",
    author_dv: "ޢާއިޝަތު ނަސްރީނާ",
    author_en: "Aishath Nasreena",
    vote_count: 31,
    impact: 2.8,
  },
  {
    id: "cl-maafaru-01-p3",
    thread_id: "thr-maafaru-01",
    parent_claim_id: null,
    side: "pro",
    body_en:
      "Strategic infrastructure value compounds. The airport's catchment unlocked nearby resort expansions; bed-night tax from those properties is supposed to flow to the atoll council under the published revenue-sharing schedule. The right ask is to verify the schedule is being followed, not to dismiss the project.",
    author_dv: "އިބްރާހީމް ޝިހާމް",
    author_en: "Ibrahim Shihaam",
    vote_count: 22,
    impact: 2.4,
  },

  // CON
  {
    id: "cl-maafaru-01-c1",
    thread_id: "thr-maafaru-01",
    parent_claim_id: null,
    side: "con",
    body_en:
      "The airport was built on a USD 60M+ Abu Dhabi Fund for Development grant (ADFD reports USD 76M+ across two phases) and now operates as a private-jet hub for luxury tourism — 804 private-jet movements in 2025 alone, up 38% YoY. The benefit is captured by resort operators; residents see almost none of the upside the project was sold on.",
    author_dv: "ފާޠިމަތު ސަޢީދު",
    author_en: "Fathmath Saeed",
    vote_count: 89,
    impact: 3.7,
  },
  {
    id: "cl-maafaru-01-c2",
    thread_id: "thr-maafaru-01",
    parent_claim_id: null,
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
    parent_claim_id: null,
    side: "con",
    body_en:
      "The Singaporean main contractor (Tuff Infrastructure) has faced public allegations of non-payment to subcontractors, sham bidding tactics, contract violations, and inflated costs. Whatever the public-benefit figure turns out to be, the procurement and delivery side of this project deserves its own audit, not just a benefit ledger.",
    author_dv: "އަޙްމަދު ނާޒިމް",
    author_en: "Ahmed Naazim",
    vote_count: 38,
    impact: 3.0,
  },
  {
    id: "cl-maafaru-01-c4",
    thread_id: "thr-maafaru-01",
    parent_claim_id: null,
    side: "con",
    body_en:
      "Comparable per-capita investment in education or healthcare infrastructure for Noonu would have served residents directly. The opportunity cost is the harder question this thread keeps asking the airport's defenders to answer with numbers, not strategy talk.",
    author_dv: "މަރްޔަމް ވަޙީދާ",
    author_en: "Mariyam Waheedha",
    vote_count: 27,
    impact: 2.6,
  },

  // ===== Nested chains (Kialo-style) =====
  // Chain 1: rebuts the "transit eases overcrowding" pro by pointing at the
  // tourism mix; the rebut is then itself rebutted with the actual MMPRC
  // forecast figure.
  {
    id: "cl-maafaru-01-p1-c1",
    thread_id: "thr-maafaru-01",
    parent_claim_id: "cl-maafaru-01-p1",
    side: "con", // rebuts the parent
    body_en:
      "Velana terminal congestion is overwhelmingly tourism-driven, not domestic transit. Diverting a fraction of domestic traffic to a regional airport doesn't move the curve on the bottleneck the parent claim cites.",
    author_dv: "ހުސެން ޝަރީފް",
    author_en: "Hussain Sharief",
    vote_count: 18,
    impact: 2.5,
  },
  {
    id: "cl-maafaru-01-p1-c1-p1",
    thread_id: "thr-maafaru-01",
    parent_claim_id: "cl-maafaru-01-p1-c1",
    side: "pro", // supports the rebut: yes, tourism-driven, but forecast keeps growing
    body_en:
      "MMPRC arrivals forecast for FY26 is +12% YoY (3rd quarterly outlook). If the parent rebut is right that Velana's bottleneck is tourism, then domestic-transit relief from regional airports is the lower-cost lever the country actually has.",
    author_dv: "ނޫޙު ފާރިޝް",
    author_en: "Nooh Faarish",
    vote_count: 9,
    impact: 2.1,
  },

  // Chain 2: under the reef-impact con, defenders point to the published
  // EIA mitigation plan; that defence is then rebutted on the verification
  // gap.
  {
    id: "cl-maafaru-01-c1-r1",
    thread_id: "thr-maafaru-01",
    parent_claim_id: "cl-maafaru-01-c1",
    side: "con", // rebuts the parent ("private-jet hub" framing)
    body_en:
      "An Environmental Impact Assessment with mitigation plan was published prior to the second-phase reef conversion, and the operating concession does cap private-jet movements per quarter. The reef-impact and tourism-capture framings each had procedural answers the parent skips over.",
    author_dv: "އިބްރާހީމް ޛާއިދު",
    author_en: "Ibrahim Zaaid",
    vote_count: 6,
    impact: 1.8,
  },
  {
    id: "cl-maafaru-01-c1-r1-r1",
    thread_id: "thr-maafaru-01",
    parent_claim_id: "cl-maafaru-01-c1-r1",
    side: "con", // rebuts the EIA-published defence
    body_en:
      "Publishing an EIA is not the same as third-party verification of mitigation. IUCN has not signed off on the post-construction monitoring data; the published EIA's reef-cover figures are EPA-stamped self-reporting. The procedural box is checked; the actual ecological question is not.",
    author_dv: "އާމިނަތު ޝަފީޤާ",
    author_en: "Aminath Shafeega",
    vote_count: 14,
    impact: 2.7,
  },

  // Chain 3: under the procurement-audit con, a short two-deep rebut
  // pointing out the contractor has since been blacklisted by ADFD.
  {
    id: "cl-maafaru-01-c3-p1",
    thread_id: "thr-maafaru-01",
    parent_claim_id: "cl-maafaru-01-c3",
    side: "con", // rebuts the parent's "needs an audit" framing by saying ADFD already acted
    body_en:
      "ADFD removed Tuff Infrastructure from its preferred-contractor list in late 2024 citing the same allegations. The audit the parent claim asks for, in effect, already happened on the lender side — even if the Maldivian procurement record hasn't followed suit.",
    author_dv: "ޢަލީ ޒަކްރިއްޔާ",
    author_en: "Ali Zakariyya",
    vote_count: 11,
    impact: 2.3,
  },
];

// getClaimsForThread + HERO_THREAD_ID moved to src/db/queries/claims.ts.
// Seed-only file.
