import type { IssueTag } from "@/lib/types";

// Per moderation policy §02 — issues where posting a claim requires
// eFaas verification. Public list, reviewed quarterly. Currently only
// judiciary because of observed coordinated brigading; reading + voting
// on judiciary threads remain anonymous. (Was comment-policy in v2.2;
// renamed in v4.0 once the comments primitive was removed in favour of
// the Kialo claim tree.)
export const FLAGGED_ISSUE_TAGS: ReadonlySet<IssueTag> = new Set(["judiciary"]);

export function claimRequiresVerification(issue: IssueTag): boolean {
  return FLAGGED_ISSUE_TAGS.has(issue);
}
