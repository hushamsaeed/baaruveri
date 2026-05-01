import { Link } from "@/i18n/navigation";
import type { Island } from "@/lib/types";

interface IslandProfileHeaderProps {
  island: Island;
}

function fmtMvr(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString("en-US");
}

export function IslandProfileHeader({ island }: IslandProfileHeaderProps) {
  return (
    <header className="border-b border-border">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 pt-8 pb-12">
        <Link
          href="/atlas"
          className="inline-flex items-center text-[12px] text-muted-foreground hover:text-foreground transition-colors mb-8 font-mono"
        >
          ← Atlas
        </Link>

        <div className="flex items-baseline justify-between mb-6 pb-4 border-b-[1.5px] border-foreground gap-4 flex-wrap">
          <div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-[0.14em] font-mono mb-2">
              <span className="dv-text mr-2">{island.atoll_dv}</span>
              {island.atoll_en} Atoll · {island.atoll_code}
            </div>
            <h1 className="text-[40px] sm:text-5xl font-semibold tracking-tight leading-none">
              <span className="dv-text">{island.name_dv}</span>
            </h1>
            <p className="text-base text-muted-foreground mt-2 tracking-wide">
              {island.name_en}
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 mb-8">
          <div>
            <dt className="text-[10.5px] text-muted-foreground uppercase tracking-[0.08em] font-mono">Population</dt>
            <dd className="font-mono text-2xl font-semibold mt-1 num">
              {island.population.toLocaleString("en-US")}
            </dd>
            <dd className="text-[10px] text-muted-foreground mt-0.5 font-mono">
              {island.population_source.label} {island.population_source.year}
            </dd>
          </div>
          <div>
            <dt className="text-[10.5px] text-muted-foreground uppercase tracking-[0.08em] font-mono">Council seats</dt>
            <dd className="font-mono text-2xl font-semibold mt-1 num">
              {island.council_seats > 0 ? island.council_seats : "—"}
            </dd>
            <dd className="text-[10px] text-muted-foreground mt-0.5 font-mono">
              elected {new Date(island.voters_source.date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
            </dd>
          </div>
          <div>
            <dt className="text-[10.5px] text-muted-foreground uppercase tracking-[0.08em] font-mono">FY26 budget</dt>
            <dd className="font-mono text-2xl font-semibold mt-1 num">
              MVR {fmtMvr(island.fy26_budget_mvr)}
            </dd>
            <dd className="text-[10px] text-muted-foreground mt-0.5 font-mono">
              gross allocation
            </dd>
          </div>
          <div>
            <dt className="text-[10.5px] text-muted-foreground uppercase tracking-[0.08em] font-mono">Active threads</dt>
            <dd className="font-mono text-2xl font-semibold mt-1 num">{island.active_threads}</dd>
            <dd className="text-[10px] text-muted-foreground mt-0.5 font-mono">
              {island.active_petitions} open petition{island.active_petitions === 1 ? "" : "s"}
            </dd>
          </div>
        </dl>

        <p className="max-w-3xl text-[15px] leading-relaxed text-foreground/85">
          {island.context_en}
        </p>
      </div>
    </header>
  );
}
