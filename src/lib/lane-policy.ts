import type { IssueTag } from "@/lib/types";
import type { Lane } from "@/components/lane-rail";

// Vignelli civic-press lane mapping. The platform's content tags
// (issue) describe the topic domain (housing, climate, etc.); the
// Vignelli lanes describe the constitutional branch where the
// topic's accountability lives. Spec §4.
//
// Mapping rationale (v0):
// - judiciary       → judiciary  (court / rule-of-law issues)
// - procurement     → parliamentary (national-budget oversight)
// - everything else → council     (island-level civic life)
//
// Refinable per-thread later (a thread on a national-housing law
// might want parliamentary; a thread on an executive directive might
// want presidency). For v0 the default keeps the four-lane
// distribution honest without needing a per-thread tag.
const ISSUE_LANE: Record<IssueTag, Lane> = {
  judiciary: "judiciary",
  procurement: "parliamentary",
  housing: "council",
  climate: "council",
  fisheries: "council",
  education: "council",
  decentralisation: "council",
};

export function issueToLane(issue: IssueTag): Lane {
  return ISSUE_LANE[issue];
}

export const LANE_COLOR_VAR: Record<Lane, string> = {
  judiciary: "var(--vignelli-ink)",
  parliamentary: "var(--vignelli-red)",
  presidency: "var(--vignelli-ochre)",
  council: "var(--vignelli-green)",
};
