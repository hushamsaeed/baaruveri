import type { IssueTag } from "@/lib/types";

// Per moderation policy §02 — issues where commenting requires eFaas
// verification. Public list, reviewed quarterly. Currently only judiciary
// because of observed coordinated brigading; reading + voting on judiciary
// threads remain anonymous.
export const FLAGGED_ISSUE_TAGS: ReadonlySet<IssueTag> = new Set(["judiciary"]);

export function commentRequiresVerification(issue: IssueTag): boolean {
  return FLAGGED_ISSUE_TAGS.has(issue);
}
