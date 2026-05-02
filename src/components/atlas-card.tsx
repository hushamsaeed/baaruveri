import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { L } from "./i18n-text";
import type { Island } from "@/lib/types";

// Vignelli civic-press atlas card — the per-island grid item on
// /atlas. Photography of islands is the only "decoration" allowed in
// the Vignelli system (spec §1, §2, §10) and only on the Atlas
// surface — but we don't have cover images yet, so this card stays
// type-only for now and uses the lane palette to mark island scale
// (population threshold) instead of decorative tinting.

interface AtlasCardProps {
  island: Island;
}

function fmtMvr(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString("en-US");
}

export function AtlasCard({ island }: AtlasCardProps) {
  const t = useTranslations("island");
  return (
    <Link
      href={`/atlas/${island.slug}`}
      className="group block hover:bg-[color:var(--paper-deep)] transition-colors"
      style={{
        background: "var(--paper)",
        borderTop: "8px solid var(--ink)",
        borderBottom: "1px solid var(--ink)",
      }}
    >
      {/* Atoll/code anchor strip — caps line at the very top */}
      <div
        className="px-5 py-2 flex items-baseline justify-between gap-3"
        style={{
          background: "var(--ink)",
          color: "var(--paper)",
        }}
      >
        <span
          className="text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{ fontFamily: "var(--font-sans-bold)" }}
        >
          <span className="dv-text me-1.5 font-bold">{island.atoll_dv}</span>
          {island.atoll_en}
        </span>
        <span
          className="font-mono text-[10px] uppercase tracking-[0.16em]"
          style={{ color: "var(--paper)" }}
        >
          {island.atoll_code}
        </span>
      </div>

      <div className="px-5 pt-4 pb-3">
        {/* Hero — DV name in MV Faseyha 700 + EN name in Archivo Black ALL CAPS */}
        <div className="dv-text font-bold text-[28px] leading-none">
          {island.name_dv}
        </div>
        <div
          className="font-display text-[24px] mt-1"
          style={{
            fontFamily: "var(--font-display), sans-serif",
            lineHeight: 0.95,
            letterSpacing: "-0.025em",
            textTransform: "uppercase",
          }}
        >
          {island.name_en}
        </div>
      </div>

      {/* Ledger — 6 rows, two columns each, 1px paper-rule dividers
          per spec §7.5. Population + voters render as monumental
          Archivo Black numerals; the rest as Archivo 700 caps for
          alignment. */}
      <dl>
        <LedgerRow
          label={t("atlas_card_label_pop")}
          value={island.population.toLocaleString("en-US")}
          monumental
        />
        <LedgerRow
          label={t("atlas_card_label_voters")}
          value={island.registered_voters.toLocaleString("en-US")}
          monumental
        />
        <LedgerRow
          label={t("atlas_card_label_seats")}
          value={
            island.council_seats > 0
              ? island.council_seats.toLocaleString("en-US")
              : "—"
          }
        />
        <LedgerRow
          label={t("atlas_card_label_budget")}
          value={`MVR ${fmtMvr(island.fy26_budget_mvr)}`}
        />
        <LedgerRow
          label={t("atlas_card_label_threads")}
          value={island.active_threads.toLocaleString("en-US")}
        />
        <LedgerRow
          label={t("atlas_card_label_petitions")}
          value={island.active_petitions.toLocaleString("en-US")}
          last
        />
      </dl>

      {/* Context lede — Inter 400 12.5px, narrow column */}
      <p
        className="px-5 py-3 text-[12.5px] leading-[1.5]"
        style={{
          color: "var(--ink-soft)",
          borderTop: "1px solid var(--ink)",
        }}
      >
        {island.context_en}
      </p>

      {/* Open profile CTA — Vignelli verb-color treatment */}
      <div
        className="px-5 py-2.5 flex items-baseline justify-between"
        style={{ borderTop: "1px solid var(--paper-rule)" }}
      >
        <span
          className="text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            fontFamily: "var(--font-sans-bold)",
            color: "var(--ink-soft)",
          }}
        >
          {island.slug}
        </span>
        <span
          className="text-[11px] font-bold uppercase tracking-[0.1em] inline-flex items-baseline gap-1.5 group-hover:underline underline-offset-2"
          style={{
            fontFamily: "var(--font-sans-bold)",
            color: "var(--vignelli-red)",
          }}
        >
          <L>{t("atlas_card_open")}</L>
          <span aria-hidden className="font-mono">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

function LedgerRow({
  label,
  value,
  monumental,
  last,
}: {
  label: string;
  value: string;
  monumental?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className="grid grid-cols-[1fr_auto] gap-3 px-5 py-2"
      style={{
        borderBottom: last ? "none" : "1px solid var(--paper-rule)",
      }}
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
        {monumental ? (
          <div
            className="font-display text-[20px] leading-none tabular-nums"
            style={{
              fontFamily: "var(--font-display), sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            {value}
          </div>
        ) : (
          <div
            className="font-mono text-[13px] tabular-nums"
            style={{ color: "var(--ink)" }}
          >
            {value}
          </div>
        )}
      </dd>
    </div>
  );
}
