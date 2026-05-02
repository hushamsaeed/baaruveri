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
    <div className="divide-y" style={{ borderColor: "var(--paper-rule)" }}>
      {roots.length === 0 ? (
        <p
          className="text-[11px] uppercase font-bold tracking-[0.1em] py-3"
          style={{
            fontFamily: "var(--font-sans-bold)",
            color: "var(--ink-soft)",
          }}
        >
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
        <div className="pt-3">
          <RootClaimAddAffordance
            threadId={threadId}
            side={side}
            attribution={attribution}
          />
        </div>
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

  // Vignelli civic-press treatment per spec §7.6:
  // - Solid PRO (vignelli-green) or CON (vignelli-red) block tag,
  //   Archivo 700 caps 10px in paper type, at line-start.
  // - Sub-claims inset by 28px with a 1px ink hairline on the inset
  //   start side (replaces the v3 "border-l-3px col-tinted card").
  const tagColor = isPro ? "var(--vignelli-green)" : "var(--vignelli-red)";
  const tagLabel = isPro ? "PRO" : "CON";
  // For nested non-root claims the SUPPORTS/REBUTS semantic still
  // matters; the tag swaps to the relational verb instead of PRO/CON.
  const nestedLabel = isPro ? t("supports_label") : t("rebuts_label");

  return (
    <div
      className={depth > 0 ? "ms-7 ps-5 mt-4" : "mt-0"}
      style={
        depth > 0 ? { borderInlineStart: "1px solid var(--ink)" } : undefined
      }
    >
      <article className="py-3">
        <div className="flex items-baseline gap-2 mb-2 flex-wrap">
          <span
            className="px-2 py-[3px] text-[10px] font-bold uppercase tracking-[0.1em] inline-flex items-baseline gap-1.5"
            style={{
              fontFamily: "var(--font-sans-bold)",
              background: tagColor,
              color: "var(--paper)",
            }}
          >
            {isRoot ? tagLabel : <L>{nestedLabel}</L>}
          </span>
          <span
            className="font-mono text-[10.5px] uppercase tracking-[0.08em]"
            style={{ color: "var(--ink-soft)" }}
          >
            {claim.id.toUpperCase()}
          </span>
          <span className="ms-auto">
            <ClaimVoteButton
              claimId={claim.id}
              threadId={threadId}
              initialCount={claim.vote_count}
              initialVoted={votedClaimIds.has(claim.id)}
            />
          </span>
        </div>

        <p
          className="text-[15px] leading-[1.6] max-w-[60ch]"
          style={{ color: "var(--ink)" }}
        >
          {claim.body_en}
        </p>
        {claim.body_dv && (
          <p
            className="dv-text text-[15px] mt-2 max-w-[60ch]"
            style={{ color: "var(--ink-soft)", lineHeight: 1.7 }}
          >
            {claim.body_dv}
          </p>
        )}

        <div
          className="flex items-baseline gap-2 mt-3 text-[10.5px] font-bold uppercase tracking-[0.1em]"
          style={{
            fontFamily: "var(--font-sans-bold)",
            color: "var(--ink-soft)",
          }}
        >
          <span className="dv-text">{claim.author_dv}</span>
          <span aria-hidden>·</span>
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
          <div>
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
          <details
            className="mt-2 ms-7 ps-5"
            style={{ borderInlineStart: "1px solid var(--ink)" }}
          >
            <summary
              className="text-[10.5px] font-bold uppercase tracking-[0.1em] cursor-pointer select-none py-2"
              style={{
                fontFamily: "var(--font-sans-bold)",
                color: "var(--ink-soft)",
              }}
            >
              <L>{t("view_n_nested", { n: countSubtree(byParent, claim.id) })}</L>
            </summary>
            <div>
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
