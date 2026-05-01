import { getTranslations } from "next-intl/server";
import { L } from "./i18n-text";
import { ClaimVoteButton } from "./claim-vote-button";
import {
  ClaimAddAffordance,
  RootClaimAddAffordance,
  type ClaimAuthorAttribution,
} from "./claim-add-form";
import { buildClaimTree, type ClaimsByParent } from "@/lib/claim-tree";
import type { Claim } from "@/lib/types";

// Direction A · Indented Ledger Tree — root claims live in the existing
// pros/cons columns; nested children indent under their parent within the
// same column. Max 4 visible levels; deeper subtrees collapse behind a
// <details> "view N more nested →" element (server-rendered, no client
// JS for the tree itself; only the vote button and add form are client).

const MAX_VISIBLE_DEPTH = 4;

interface ClaimTreeProps {
  claims: readonly Claim[];
  side: "pro" | "con";
  threadId: string;
  votedClaimIds: ReadonlySet<string>;
  attribution: ClaimAuthorAttribution | null; // null means add affordance hidden (no auth context yet)
}

export async function ClaimTree({
  claims,
  side,
  threadId,
  votedClaimIds,
  attribution,
}: ClaimTreeProps) {
  const byParent = buildClaimTree(claims);
  const roots = (byParent.get(null) ?? []).filter((c) => c.side === side);
  const t = await getTranslations("thread_detail");

  // Root-level entry point: every column gets an "+ add first / + add"
  // button so a user can post a top-level pro/con. Hidden when
  // attribution is null (auth ungated by tier policy or anon cookie not
  // yet minted) — the same gate that hides the per-claim affordance.
  return (
    <div className="grid gap-3">
      {roots.length === 0 ? (
        <p className="text-[12px] text-muted-foreground italic">
          {attribution ? (
            <L>{t(side === "pro" ? "be_first_pro" : "be_first_con")}</L>
          ) : (
            <L>{t("no_claims_yet")}</L>
          )}
        </p>
      ) : (
        roots.map((c) => (
          <ClaimNode
            key={c.id}
            claim={c}
            byParent={byParent}
            depth={0}
            parentSide={null}
            threadId={threadId}
            votedClaimIds={votedClaimIds}
            attribution={attribution}
            t={t}
          />
        ))
      )}
      {attribution && (
        <RootClaimAddAffordance
          threadId={threadId}
          side={side}
          attribution={attribution}
        />
      )}
    </div>
  );
}

type Translator = Awaited<ReturnType<typeof getTranslations>>;

interface ClaimNodeProps {
  claim: Claim;
  byParent: ClaimsByParent;
  depth: number;
  parentSide: "pro" | "con" | null; // null = root claim
  threadId: string;
  votedClaimIds: ReadonlySet<string>;
  attribution: ClaimAuthorAttribution | null;
  t: Translator;
}

function ClaimNode({
  claim,
  byParent,
  depth,
  parentSide,
  threadId,
  votedClaimIds,
  attribution,
  t,
}: ClaimNodeProps) {
  const children = byParent.get(claim.id) ?? [];
  const isPro = claim.side === "pro";
  const isRoot = parentSide === null;

  // Side badge for nested children only — labels children's stance
  // *relative to their parent* (Kialo semantics: pro=supports, con=rebuts).
  const badgeLabel = isPro ? t("supports_label") : t("rebuts_label");
  const badgeGlyph = isPro ? "⊕" : "⊟";
  const badgeColor = isPro
    ? "text-[color:var(--under)]"
    : "text-[color:var(--over)]";

  return (
    <div className={depth > 0 ? "ms-6" : ""}>
      <article
        className={`bg-card border border-border border-l-[3px] p-4 ${
          isPro ? "border-l-[color:var(--under)]" : "border-l-[color:var(--over)]"
        }`}
      >
        <div className="flex items-baseline justify-between gap-3 mb-2">
          {isRoot ? (
            <span
              className={`font-mono text-[10px] uppercase tracking-[0.12em] font-semibold ${
                isPro
                  ? "text-[color:var(--under)]"
                  : "text-[color:var(--over)]"
              }`}
            >
              <L>{isPro ? t("supports_label") : t("rebuts_label")}</L>
            </span>
          ) : (
            <span
              className={`font-mono text-[10px] uppercase tracking-[0.12em] font-semibold ${badgeColor}`}
            >
              <span aria-hidden className="me-1">
                {badgeGlyph}
              </span>
              <L>{badgeLabel}</L>
            </span>
          )}
          <ClaimVoteButton
            claimId={claim.id}
            threadId={threadId}
            initialCount={claim.vote_count}
            initialVoted={votedClaimIds.has(claim.id)}
          />
        </div>

        <p className="text-[13.5px] leading-relaxed">{claim.body_en}</p>
        {claim.body_dv && (
          <p className="dv-text text-[13.5px] mt-2 text-foreground/80">
            {claim.body_dv}
          </p>
        )}

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border text-[11px] text-muted-foreground">
          <span className="dv-text">{claim.author_dv}</span>
          <span>·</span>
          <span className="font-mono">{claim.author_en}</span>
        </div>

        {attribution && (
          <ClaimAddAffordance
            threadId={threadId}
            parentClaimId={claim.id}
            attribution={attribution}
          />
        )}
      </article>

      {children.length > 0 &&
        (depth + 1 < MAX_VISIBLE_DEPTH ? (
          <div className="grid gap-3 mt-3">
            {children.map((child) => (
              <ClaimNode
                key={child.id}
                claim={child}
                byParent={byParent}
                depth={depth + 1}
                parentSide={claim.side}
                threadId={threadId}
                votedClaimIds={votedClaimIds}
                attribution={attribution}
                t={t}
              />
            ))}
          </div>
        ) : (
          <details className="mt-3 ms-6">
            <summary className="text-[11px] font-mono uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground cursor-pointer select-none">
              <L>{t("view_n_nested", { n: countSubtree(byParent, claim.id) })}</L>
            </summary>
            <div className="grid gap-3 mt-3">
              {children.map((child) => (
                <ClaimNode
                  key={child.id}
                  claim={child}
                  byParent={byParent}
                  depth={depth + 1}
                  parentSide={claim.side}
                  threadId={threadId}
                  votedClaimIds={votedClaimIds}
                  attribution={attribution}
                  t={t}
                />
              ))}
            </div>
          </details>
        ))}
    </div>
  );
}

function countSubtree(byParent: ClaimsByParent, rootId: string): number {
  const children = byParent.get(rootId) ?? [];
  return children.reduce(
    (sum, c) => sum + 1 + countSubtree(byParent, c.id),
    0
  );
}
