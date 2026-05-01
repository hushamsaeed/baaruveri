import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { L } from "./i18n-text";
import { daysUntil, fmtDate } from "@/lib/date";
import type { Petition } from "@/lib/types";

interface PetitionListItemProps {
  petition: Petition;
}

export function PetitionListItem({ petition }: PetitionListItemProps) {
  const tp = useTranslations("petition");
  const pct = Math.min(100, (petition.signatures / petition.threshold) * 100);
  const days = daysUntil(petition.closes_at);
  const scopeLabel =
    petition.scope === "national"
      ? tp("scope_national_short")
      : tp("scope_island_short");

  return (
    <Link
      href={`/petitions/${petition.id}`}
      className="block bg-card border border-border p-5 hover:border-primary/40 transition-colors"
    >
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2 font-mono uppercase tracking-[0.1em]">
        <span className="live-dot" aria-hidden="true" />
        <L>{scopeLabel}</L>
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
            <L>{tp("live_signatures")}</L>
          </div>
          <div className="h-[5px] bg-muted mt-2 relative">
            <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[13px]">
            <span className="num">{days}</span>{" "}
            <span className="text-muted-foreground"><L>{tp("days_left")}</L></span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            <L>{tp("closes_on", { date: fmtDate(petition.closes_at) })}</L>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[11px] text-muted-foreground">
        <span>
          <L>{tp("started_by_label")}</L>{" "}
          <span className="dv-text mx-1">{petition.started_by_dv}</span>
        </span>
        <span>·</span>
        <span className="font-mono">
          <L>{tp("verified_short", { pct: petition.efaas_verified_pct })}</L>
        </span>
      </div>
    </Link>
  );
}
