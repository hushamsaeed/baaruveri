"use client";

import { useOptimistic, useTransition } from "react";
import { useTranslations } from "next-intl";
import { submitClaimVoteAction } from "@/app/[locale]/sandbar/[threadId]/claim-actions";

interface ClaimVoteButtonProps {
  claimId: string;
  threadId: string;
  initialCount: number;
  initialVoted: boolean;
}

export function ClaimVoteButton({
  claimId,
  threadId,
  initialCount,
  initialVoted,
}: ClaimVoteButtonProps) {
  const t = useTranslations("thread_detail");
  const [, startTransition] = useTransition();

  const [state, addOptimistic] = useOptimistic<
    { count: number; voted: boolean },
    { delta: number; voted: boolean }
  >({ count: initialCount, voted: initialVoted }, (current, action) => ({
    count: Math.max(current.count + action.delta, 0),
    voted: action.voted,
  }));

  function handleClick() {
    const willVote = !state.voted;
    startTransition(async () => {
      addOptimistic({ delta: willVote ? 1 : -1, voted: willVote });
      const result = await submitClaimVoteAction(claimId, threadId);
      if (!result.ok) {
        // Revert: re-apply opposite delta. The next render from the server
        // will be authoritative; this just gives immediate user feedback.
        addOptimistic({ delta: willVote ? -1 : 1, voted: !willVote });
        // Simple alert is acceptable for v3 prototype tier-required errors.
        alert(result.reason);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={state.voted ? t("vote_aria_unvote") : t("vote_aria_upvote")}
      className={`inline-flex items-baseline gap-1.5 font-mono text-[12px] tabular-nums px-1.5 py-0.5 -mx-1.5 rounded-sm transition-colors ${
        state.voted
          ? "text-[color:var(--primary)] hover:bg-secondary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
      }`}
    >
      <span aria-hidden className="text-[13px] leading-none">
        {state.voted ? "▲" : "△"}
      </span>
      <span>{state.count}</span>
    </button>
  );
}
