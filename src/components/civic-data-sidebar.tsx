import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { L } from "./i18n-text";
import type {
  Island,
  CouncilMember,
  BudgetLine,
  Thread,
  Petition,
} from "@/lib/types";
import { getCouncilMembers } from "@/db/queries/council";
import { getBudgetLines } from "@/db/queries/budgets";
import { getThreadsForIsland } from "@/db/queries/threads";
import { getPetitionsForIsland } from "@/db/queries/petitions";
import { getSignatureCounts } from "@/db/queries/signatures";

export interface CivicSidebarData {
  council: CouncilMember[];
  budgetLines: BudgetLine[];
  // Already filtered against excludeThreadId by the loader.
  otherThreads: Thread[];
  // Already enriched with live signatures (baseline + session) by the loader.
  petitions: Petition[];
}

/**
 * Loads everything CivicDataSidebar renders, with the live-signature
 * enrichment already applied. Call this from page-level Promise.all
 * blocks instead of letting the sidebar component refetch on every
 * render — the perf-audit flagged the previous "sidebar runs 4
 * queries" pattern as a redundant round-trip on every thread/petition
 * detail page render.
 */
export async function loadCivicSidebar(
  islandId: string,
  excludeThreadId?: string
): Promise<CivicSidebarData> {
  const [council, budgetLines, threadsForIsland, petitionsRaw] =
    await Promise.all([
      getCouncilMembers(islandId),
      getBudgetLines(islandId),
      getThreadsForIsland(islandId),
      getPetitionsForIsland(islandId),
    ]);
  const sessionCounts = await getSignatureCounts(petitionsRaw.map((p) => p.id));
  const petitions = petitionsRaw.map((p) => ({
    ...p,
    signatures: p.signatures + (sessionCounts.get(p.id) ?? 0),
  }));
  const otherThreads = threadsForIsland.filter((t) => t.id !== excludeThreadId);
  return { council, budgetLines, otherThreads, petitions };
}

interface CivicDataSidebarProps {
  island: Island;
  data: CivicSidebarData;
}

function fmtMvr(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString("en-US");
}

export async function CivicDataSidebar({
  island,
  data,
}: CivicDataSidebarProps) {
  const ts = await getTranslations("civic_sidebar");
  const { council, budgetLines, otherThreads, petitions } = data;
  const chair = council.find((c) => c.role_en === "Chair");
  const totalAllocated = budgetLines.reduce((s, l) => s + l.allocated_mvr, 0);
  const totalSpent = budgetLines.reduce((s, l) => s + l.spent_mvr, 0);

  return (
    <aside className="bg-muted/40 border border-border p-5 lg:sticky lg:top-6 self-start">
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground mb-3">
        <L>{ts("header")}</L>
      </div>

      <div className="pb-4 mb-4 border-b border-border">
        <div className="text-xs text-muted-foreground font-mono mb-1">
          <span className="dv-text me-1">{island.atoll_dv}</span>
          {island.atoll_en} · {island.atoll_code}
        </div>
        <div className="text-2xl font-semibold leading-tight">
          <span className="dv-text">{island.name_dv}</span>
        </div>
        <div className="text-[12px] text-muted-foreground mt-1">{island.name_en}</div>
      </div>

      <dl className="font-mono text-[12px] mb-4">
        <div className="grid grid-cols-[1fr_auto] py-1.5 border-b border-border">
          <dt className="text-muted-foreground"><L>{ts("stat_population")}</L></dt>
          <dd className="num">{island.population.toLocaleString("en-US")}</dd>
        </div>
        <div className="grid grid-cols-[1fr_auto] py-1.5 border-b border-border">
          <dt className="text-muted-foreground"><L>{ts("stat_voters")}</L></dt>
          <dd className="num">{island.registered_voters.toLocaleString("en-US")}</dd>
        </div>
        <div className="grid grid-cols-[1fr_auto] py-1.5 border-b border-border">
          <dt className="text-muted-foreground"><L>{ts("stat_budget")}</L></dt>
          <dd className="num">MVR {fmtMvr(island.fy26_budget_mvr)}</dd>
        </div>
        <div className="grid grid-cols-[1fr_auto] py-1.5">
          <dt className="text-muted-foreground"><L>{ts("stat_q1_spent")}</L></dt>
          <dd className="num">
            MVR {fmtMvr(totalSpent)}{" "}
            <span className="text-muted-foreground">
              ({totalAllocated ? Math.round((totalSpent / totalAllocated) * 100) : 0}%)
            </span>
          </dd>
        </div>
      </dl>

      {chair && (
        <div className="pb-4 mb-4 border-b border-border">
          <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-mono mb-1.5">
            <L>{ts("council_chair")}</L>
          </div>
          <div className="text-[14px] font-semibold leading-tight">
            <span className="dv-text">{chair.name_dv}</span>
          </div>
          <div className="text-[11.5px] text-muted-foreground font-mono mt-0.5">
            {chair.name_en} · {chair.party}
          </div>
        </div>
      )}

      {petitions.length > 0 && (
        <div className="pb-4 mb-4 border-b border-border">
          <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-mono mb-2">
            <L>{ts("open_petitions_for", { island: island.name_en })}</L>
          </div>
          <ul className="space-y-2.5">
            {petitions.slice(0, 3).map((p) => {
              const pct = Math.min(100, (p.signatures / p.threshold) * 100);
              return (
                <li key={p.id} className="text-[12px]">
                  <Link
                    href={`/petitions/${p.id}`}
                    className="block hover:text-primary transition-colors"
                  >
                    <div className="leading-snug mb-1">{p.title_en}</div>
                    <div className="font-mono text-[11px] text-muted-foreground flex items-center gap-2">
                      <span className="num">{p.signatures.toLocaleString("en-US")}</span>
                      <span>/</span>
                      <span className="num">{p.threshold.toLocaleString("en-US")}</span>
                      <span className="flex-1 h-[3px] bg-muted ms-1 relative overflow-hidden">
                        <span
                          className="absolute start-0 top-0 h-full bg-primary"
                          style={{ width: `${pct}%` }}
                        />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {otherThreads.length > 0 && (
        <div className="pb-4 mb-4 border-b border-border">
          <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-mono mb-2">
            <L>{ts("other_threads")}</L>
          </div>
          <ul className="space-y-2 text-[12px]">
            {otherThreads.slice(0, 3).map((t) => (
              <li key={t.id}>
                <Link
                  href={`/sandbar/${t.id}`}
                  className="block hover:text-primary transition-colors leading-snug"
                >
                  {t.title_en}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        href={`/atlas/${island.slug}`}
        className="inline-flex items-center text-[12px] text-primary hover:underline font-mono"
      >
        <L>{ts("view_full_profile")}</L>
      </Link>
    </aside>
  );
}
