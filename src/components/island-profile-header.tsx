import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { L } from "./i18n-text";
import { fmtDate } from "@/lib/date";
import type { Island } from "@/lib/types";

// Vignelli civic-press island-profile header — spec §7.1 + §7.5.
// 8px ink top edge to mark a new "publication", atoll meta in mono
// caps + ink-block, monumental DV + EN names, four-up ledger of
// hero numerals (Archivo Black 32-44px tabular), then the context
// lede.

interface IslandProfileHeaderProps {
  island: Island;
}

function fmtMvr(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString("en-US");
}

export function IslandProfileHeader({ island }: IslandProfileHeaderProps) {
  const t = useTranslations("island");
  const tn = useTranslations("nav");
  return (
    <header
      className="bg-paper"
      style={{
        borderTop: "8px solid var(--ink)",
        borderBottom: "2px solid var(--ink)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-7">
        <Link
          href="/atlas"
          className="inline-flex items-baseline text-[10.5px] uppercase font-bold tracking-[0.14em] hover:underline underline-offset-2 mb-6"
          style={{
            fontFamily: "var(--font-sans-bold)",
            color: "var(--vignelli-red)",
          }}
        >
          <L>{tn("back_to_atlas")}</L>
        </Link>

        {/* Atoll anchor strip */}
        <div
          className="inline-flex items-baseline gap-3 px-3 py-1.5 mb-6"
          style={{
            background: "var(--ink)",
            color: "var(--paper)",
          }}
        >
          <span
            className="text-[10.5px] uppercase font-bold tracking-[0.14em]"
            style={{ fontFamily: "var(--font-sans-bold)" }}
          >
            <span className="dv-text me-1.5 font-bold">
              {island.atoll_dv}
            </span>
            {island.atoll_en} Atoll
          </span>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.14em]">
            {island.atoll_code}
          </span>
        </div>

        {/* Hero name pair — DV first then EN, both monumental */}
        <div className="dv-text font-bold text-[44px] sm:text-[56px] leading-none">
          {island.name_dv}
        </div>
        <h1
          className="font-display text-[36px] sm:text-[48px] mt-2"
          style={{
            fontFamily: "var(--font-display), sans-serif",
            lineHeight: 0.95,
            letterSpacing: "-0.025em",
            textTransform: "uppercase",
          }}
        >
          {island.name_en}
        </h1>

        {/* Four-up ledger of hero numerals */}
        <dl
          className="grid grid-cols-2 sm:grid-cols-4 gap-y-5 mt-8"
          style={{
            borderTop: "2px solid var(--ink)",
            borderBottom: "1px solid var(--ink)",
          }}
        >
          <HeroLedgerCell
            label={t("atlas_card_label_pop")}
            value={island.population.toLocaleString("en-US")}
            sub={`${island.population_source.label} ${island.population_source.year}`}
          />
          <HeroLedgerCell
            label={t("atlas_card_label_seats")}
            value={
              island.council_seats > 0
                ? island.council_seats.toLocaleString("en-US")
                : "—"
            }
            sub={t("fact_council_elected", {
              date: fmtDate(island.voters_source.date),
            })}
          />
          <HeroLedgerCell
            label={t("atlas_card_label_budget")}
            value={`MVR ${fmtMvr(island.fy26_budget_mvr)}`}
            sub={t("fact_budget_meta")}
          />
          <HeroLedgerCell
            label={t("atlas_card_label_threads")}
            value={island.active_threads.toLocaleString("en-US")}
            sub={
              island.active_petitions === 1
                ? t("fact_open_petitions_one", {
                    count: island.active_petitions,
                  })
                : t("fact_open_petitions_other", {
                    count: island.active_petitions,
                  })
            }
            isLast
          />
        </dl>

        {/* Context lede */}
        <p
          className="max-w-[64ch] text-[16px] leading-[1.45] mt-6"
          style={{ color: "var(--ink)", fontWeight: 500 }}
        >
          {island.context_en}
        </p>
      </div>
    </header>
  );
}

function HeroLedgerCell({
  label,
  value,
  sub,
  isLast,
}: {
  label: string;
  value: string;
  sub: string;
  isLast?: boolean;
}) {
  return (
    <div
      className="px-4 sm:px-6 py-4"
      style={{
        borderInlineEnd: isLast ? "none" : "1px solid var(--paper-rule)",
      }}
    >
      <dt
        className="text-[10px] uppercase font-bold tracking-[0.12em] mb-1.5"
        style={{
          fontFamily: "var(--font-sans-bold)",
          color: "var(--ink-soft)",
        }}
      >
        <L>{label}</L>
      </dt>
      <dd
        className="font-display text-[26px] sm:text-[32px] leading-none tabular-nums"
        style={{
          fontFamily: "var(--font-display), sans-serif",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </dd>
      <dd
        className="font-mono text-[10px] mt-1.5"
        style={{ color: "var(--ink-soft)" }}
      >
        <L>{sub}</L>
      </dd>
    </div>
  );
}
