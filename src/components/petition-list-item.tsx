import Link from "next/link";
import type { Petition } from "@/lib/types";

interface PetitionListItemProps {
  petition: Petition;
}

function daysUntil(iso: string): number {
  const target = new Date(iso).getTime();
  const now = new Date("2026-05-01").getTime();
  return Math.max(0, Math.round((target - now) / (1000 * 60 * 60 * 24)));
}

export function PetitionListItem({ petition }: PetitionListItemProps) {
  const pct = Math.min(100, (petition.signatures / petition.threshold) * 100);
  const days = daysUntil(petition.closes_at);
  const scopeLabel =
    petition.scope === "national"
      ? "National · Parliament agenda threshold"
      : "Island · Council response threshold";

  return (
    <Link
      href={`/petitions/${petition.id}`}
      className="block bg-card border border-border p-5 hover:border-primary/40 transition-colors"
    >
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2 font-mono uppercase tracking-[0.1em]">
        <span className="live-dot" aria-hidden="true" />
        <span>{scopeLabel}</span>
      </div>
      <h3 className="text-base font-semibold leading-snug">
        <span className="dv-text">{petition.title_dv}</span>
      </h3>
      <p className="text-[13px] text-muted-foreground mt-2 leading-relaxed">
        {petition.title_en}
      </p>
      {petition.summary_en && (
        <p className="text-[13px] mt-2 leading-relaxed">{petition.summary_en}</p>
      )}

      <div className="grid grid-cols-[1fr_auto] gap-4 items-end mt-4 pt-3 border-t border-border">
        <div>
          <div className="font-mono text-[15px] font-semibold">
            <span className="num">{petition.signatures.toLocaleString("en-US")}</span>
            <span className="text-muted-foreground"> / {petition.threshold.toLocaleString("en-US")}</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Signatures
          </div>
          <div className="h-[5px] bg-muted mt-2 relative">
            <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[13px]">
            <span className="num">{days}</span>
            <span className="text-muted-foreground"> days left</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Closes{" "}
            {new Date(petition.closes_at).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[11px] text-muted-foreground">
        <span>
          Started by <span className="dv-text mx-1">{petition.started_by_dv}</span>
        </span>
        <span>·</span>
        <span className="font-mono">{petition.efaas_verified_pct}% eFaas-verified</span>
      </div>
    </Link>
  );
}
