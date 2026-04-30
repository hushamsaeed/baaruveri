import type { Claim } from "@/lib/types";

interface ClaimCardProps {
  claim: Claim;
  index: number;
}

export function ClaimCard({ claim, index }: ClaimCardProps) {
  const isPro = claim.side === "pro";
  return (
    <article
      className={`bg-card border border-border border-l-[3px] p-4 ${
        isPro ? "border-l-[color:var(--under)]" : "border-l-[color:var(--over)]"
      }`}
    >
      <div className="flex items-baseline justify-between mb-2">
        <span
          className={`font-mono text-[10px] uppercase tracking-[0.12em] font-semibold ${
            isPro ? "text-[color:var(--under)]" : "text-[color:var(--over)]"
          }`}
        >
          {isPro ? "Pro" : "Con"} · {String(index).padStart(2, "0")}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">
          +{claim.vote_count} · impact {claim.impact.toFixed(1)}/4
        </span>
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
    </article>
  );
}
