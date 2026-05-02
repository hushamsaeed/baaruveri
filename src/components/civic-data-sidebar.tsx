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
    <aside
      className="lg:sticky lg:top-6 self-start"
      style={{
        background: "var(--paper)",
        borderTop: "8px solid var(--ink)",
        borderBottom: "2px solid var(--ink)",
      }}
    >
      {/* Section head — Vignelli §3 */}
      <div
        className="px-5 py-2.5 text-[10px] uppercase font-bold tracking-[0.14em]"
        style={{
          fontFamily: "var(--font-sans-bold)",
          background: "var(--ink)",
          color: "var(--paper)",
        }}
      >
        <L>{ts("header")}</L>
      </div>

      {/* Island block — atoll meta on top, name displayed monumentally */}
      <div
        className="px-5 py-4"
        style={{ borderBottom: "1px solid var(--ink)" }}
      >
        <div
          className="font-mono text-[10.5px] uppercase tracking-[0.14em] mb-2"
          style={{ color: "var(--ink-soft)" }}
        >
          <span className="dv-text me-1.5 font-bold">{island.atoll_dv}</span>
          {island.atoll_en} · {island.atoll_code}
        </div>
        <div className="dv-text font-bold text-[26px] leading-[1.05]">
          {island.name_dv}
        </div>
        <div
          className="font-display text-[20px] mt-0.5"
          style={{
            fontFamily: "var(--font-display), sans-serif",
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
          }}
        >
          {island.name_en}
        </div>
      </div>

      {/* Tabular ledger — spec §7.5 */}
      <dl>
        <LedgerRow
          label={ts("stat_population")}
          value={island.population.toLocaleString("en-US")}
        />
        <LedgerRow
          label={ts("stat_voters")}
          value={island.registered_voters.toLocaleString("en-US")}
        />
        <LedgerRow
          label={ts("stat_budget")}
          value={`MVR ${fmtMvr(island.fy26_budget_mvr)}`}
        />
        <LedgerRow
          label={ts("stat_q1_spent")}
          value={`MVR ${fmtMvr(totalSpent)}`}
          sub={`${
            totalAllocated
              ? Math.round((totalSpent / totalAllocated) * 100)
              : 0
          }% allocated`}
        />
      </dl>

      {chair && (
        <div
          className="px-5 py-3"
          style={{ borderTop: "1px solid var(--ink)" }}
        >
          <div
            className="text-[9.5px] uppercase font-bold tracking-[0.12em] mb-1"
            style={{
              fontFamily: "var(--font-sans-bold)",
              color: "var(--ink-soft)",
            }}
          >
            <L>{ts("council_chair")}</L>
          </div>
          <div className="dv-text font-bold text-[15px] leading-tight">
            {chair.name_dv}
          </div>
          <div
            className="font-mono text-[10.5px] uppercase tracking-[0.1em] mt-0.5"
            style={{ color: "var(--ink-soft)" }}
          >
            {chair.name_en} · {chair.party}
          </div>
        </div>
      )}

      {petitions.length > 0 && (
        <div
          className="px-5 py-3"
          style={{ borderTop: "1px solid var(--ink)" }}
        >
          <div
            className="text-[9.5px] uppercase font-bold tracking-[0.12em] mb-2"
            style={{
              fontFamily: "var(--font-sans-bold)",
              color: "var(--ink-soft)",
            }}
          >
            <L>{ts("open_petitions_for", { island: island.name_en })}</L>
          </div>
          <ul className="space-y-2">
            {petitions.slice(0, 3).map((p) => {
              const pct = Math.min(100, (p.signatures / p.threshold) * 100);
              return (
                <li key={p.id}>
                  <Link
                    href={`/petitions/${p.id}`}
                    className="block group"
                  >
                    <div
                      className="text-[12px] leading-snug mb-1.5 group-hover:underline underline-offset-2"
                      style={{ color: "var(--ink)" }}
                    >
                      {p.title_en}
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[10.5px] tabular-nums">
                      <span style={{ color: "var(--ink)" }}>
                        {p.signatures.toLocaleString("en-US")}
                      </span>
                      <span style={{ color: "var(--ink-soft)" }}>/</span>
                      <span style={{ color: "var(--ink-soft)" }}>
                        {p.threshold.toLocaleString("en-US")}
                      </span>
                      <span
                        className="flex-1 h-[3px] ms-1 relative overflow-hidden"
                        style={{ background: "var(--paper-rule)" }}
                      >
                        <span
                          className="absolute start-0 top-0 h-full"
                          style={{
                            width: `${pct}%`,
                            background: "var(--vignelli-red)",
                          }}
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
        <div
          className="px-5 py-3"
          style={{ borderTop: "1px solid var(--ink)" }}
        >
          <div
            className="text-[9.5px] uppercase font-bold tracking-[0.12em] mb-2"
            style={{
              fontFamily: "var(--font-sans-bold)",
              color: "var(--ink-soft)",
            }}
          >
            <L>{ts("other_threads")}</L>
          </div>
          <ul className="space-y-1.5">
            {otherThreads.slice(0, 3).map((t) => (
              <li key={t.id}>
                <Link
                  href={`/sandbar/${t.id}`}
                  className="block text-[12px] leading-snug hover:underline underline-offset-2"
                  style={{ color: "var(--ink)" }}
                >
                  {t.title_en}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        className="px-5 py-3"
        style={{ borderTop: "1px solid var(--ink)" }}
      >
        <Link
          href={`/atlas/${island.slug}`}
          className="inline-flex items-baseline gap-1 text-[11px] font-bold uppercase tracking-[0.1em] hover:underline underline-offset-2"
          style={{
            fontFamily: "var(--font-sans-bold)",
            color: "var(--vignelli-red)",
          }}
        >
          <L>{ts("view_full_profile")}</L>
          <span aria-hidden className="font-mono">
            →
          </span>
        </Link>
      </div>
    </aside>
  );
}

function LedgerRow({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div
      className="grid grid-cols-[1fr_auto] gap-3 px-5 py-2.5"
      style={{ borderBottom: "1px solid var(--paper-rule)" }}
    >
      <dt
        className="text-[10px] uppercase font-bold tracking-[0.12em] self-center"
        style={{
          fontFamily: "var(--font-sans-bold)",
          color: "var(--ink-soft)",
        }}
      >
        <L>{label}</L>
      </dt>
      <dd className="text-end">
        <div
          className="font-display text-[20px] leading-none tabular-nums"
          style={{
            fontFamily: "var(--font-display), sans-serif",
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </div>
        {sub && (
          <div
            className="font-mono text-[10px] mt-0.5"
            style={{ color: "var(--ink-soft)" }}
          >
            {sub}
          </div>
        )}
      </dd>
    </div>
  );
}
