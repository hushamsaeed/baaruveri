import Link from "next/link";
import type { Island } from "@/lib/types";

interface AtlasCardProps {
  island: Island;
}

function fmtMvr(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString("en-US");
}

export function AtlasCard({ island }: AtlasCardProps) {
  return (
    <Link
      href={`/atlas/${island.slug}`}
      className="group block bg-card border border-border p-5 hover:border-primary/40 transition-colors"
    >
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <div className="text-xl font-bold dv-text leading-none">
            {island.name_dv}
          </div>
          <div className="text-xs text-muted-foreground mt-1 tracking-wide">
            {island.name_en}
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
          <span className="dv-text mr-1">{island.atoll_dv}</span>
          {island.atoll_en} · {island.atoll_code}
        </span>
      </div>

      <dl className="font-mono text-[13px]">
        <div className="grid grid-cols-[1fr_auto] py-1.5 border-b border-border">
          <dt className="text-muted-foreground">Population</dt>
          <dd className="num">{island.population.toLocaleString("en-US")}</dd>
        </div>
        <div className="grid grid-cols-[1fr_auto] py-1.5 border-b border-border">
          <dt className="text-muted-foreground">Registered voters</dt>
          <dd className="num">{island.registered_voters.toLocaleString("en-US")}</dd>
        </div>
        <div className="grid grid-cols-[1fr_auto] py-1.5 border-b border-border">
          <dt className="text-muted-foreground">Council seats</dt>
          <dd className="num">{island.council_seats > 0 ? island.council_seats : "—"}</dd>
        </div>
        <div className="grid grid-cols-[1fr_auto] py-1.5 border-b border-border">
          <dt className="text-muted-foreground">FY26 budget</dt>
          <dd className="num">MVR {fmtMvr(island.fy26_budget_mvr)}</dd>
        </div>
        <div className="grid grid-cols-[1fr_auto] py-1.5 border-b border-border">
          <dt className="text-muted-foreground">Active threads</dt>
          <dd className="num">{island.active_threads}</dd>
        </div>
        <div className="grid grid-cols-[1fr_auto] py-1.5">
          <dt className="text-muted-foreground">Open petitions</dt>
          <dd className="num">{island.active_petitions}</dd>
        </div>
      </dl>

      <p className="text-[11px] text-muted-foreground mt-3 pt-3 border-t border-border leading-relaxed">
        {island.context_en}
      </p>
    </Link>
  );
}
