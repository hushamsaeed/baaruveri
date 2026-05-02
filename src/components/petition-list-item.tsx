import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { L } from "./i18n-text";
import { daysUntil, fmtDate } from "@/lib/date";
import type { Petition } from "@/lib/types";

// Vignelli civic-press petition row — spec §7.5 ledger-row variant.
// Petitions get the parliamentary lane stripe + live-dot pulse on
// the signature counter (the only animated element on the page per
// spec §2: "live-dot pulse" is the single permitted semi-transparent
// overlay).

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
  // Petitions ride the parliamentary lane (national → Parliament
  // agenda) or council lane (island-level → council response). Lane
  // colors per spec §4.
  const laneColor =
    petition.scope === "national"
      ? "var(--vignelli-red)"
      : "var(--vignelli-green)";

  return (
    <Link
      href={`/petitions/${petition.id}`}
      className="block relative hover:bg-[color:var(--paper-deep)] transition-colors"
      style={{
        background: "var(--paper)",
        borderInlineStart: `8px solid ${laneColor}`,
        borderBottom: "1px solid var(--ink)",
      }}
    >
      <article className="px-7 sm:px-9 py-6 sm:py-7">
        {/* Anchor strip: live-dot · scope · ID */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3 mb-3">
          <span
            className="live-dot"
            aria-hidden="true"
            style={{ background: "var(--vignelli-red)" }}
          />
          <span
            className="px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{
              fontFamily: "var(--font-sans-bold)",
              background: laneColor,
              color: "var(--paper)",
            }}
          >
            <L>{scopeLabel}</L>
          </span>
          <span
            className="font-mono text-[10.5px] uppercase tracking-[0.16em] font-bold ms-auto"
            style={{ color: "var(--ink-soft)" }}
          >
            {petition.id.toUpperCase()}
          </span>
        </div>

        {/* Hero title — Archivo Black ALL CAPS + DV title MV Faseyha */}
        <h3
          className="font-display text-[24px] sm:text-[30px] mb-1.5 max-w-[28ch]"
          style={{
            fontFamily: "var(--font-display), sans-serif",
            lineHeight: 0.95,
            letterSpacing: "-0.025em",
            textTransform: "uppercase",
          }}
        >
          {petition.title_en}
        </h3>
        <p
          className="dv-text font-bold text-[20px] sm:text-[24px] max-w-[28ch] mb-4"
          style={{ lineHeight: 1.4 }}
        >
          {petition.title_dv}
        </p>

        {petition.summary_en && (
          <p
            className="text-[14px] sm:text-[15px] leading-[1.45] max-w-[56ch] mb-5"
            style={{ color: "var(--ink)", fontWeight: 500 }}
          >
            {petition.summary_en}
          </p>
        )}

        {/* Counter + progress + closing window — Vignelli ledger */}
        <div
          className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-x-6 gap-y-3 items-end pt-4"
          style={{ borderTop: "2px solid var(--ink)" }}
        >
          <div>
            <div
              className="font-display text-[28px] sm:text-[34px] tabular-nums"
              style={{
                fontFamily: "var(--font-display), sans-serif",
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              {petition.signatures.toLocaleString("en-US")}
              <span
                className="font-mono text-[14px] ms-2"
                style={{ color: "var(--ink-soft)", letterSpacing: 0 }}
              >
                / {petition.threshold.toLocaleString("en-US")}
              </span>
            </div>
            <div
              className="text-[10px] uppercase font-bold tracking-[0.12em] mt-1"
              style={{
                fontFamily: "var(--font-sans-bold)",
                color: "var(--ink-soft)",
              }}
            >
              <L>{tp("live_signatures")}</L>
            </div>
            <div
              className="h-[4px] mt-2 relative"
              style={{ background: "var(--paper-rule)" }}
            >
              <div
                className="h-full"
                style={{
                  width: `${pct}%`,
                  background: "var(--vignelli-red)",
                }}
              />
            </div>
          </div>
          <div className="text-end">
            <div
              className="font-display text-[24px] sm:text-[28px] tabular-nums"
              style={{
                fontFamily: "var(--font-display), sans-serif",
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              {days}
            </div>
            <div
              className="text-[10px] uppercase font-bold tracking-[0.12em] mt-1"
              style={{
                fontFamily: "var(--font-sans-bold)",
                color: "var(--ink-soft)",
              }}
            >
              <L>{tp("days_left")}</L>
            </div>
            <div
              className="font-mono text-[10.5px] mt-1"
              style={{ color: "var(--ink-soft)" }}
            >
              <L>{tp("closes_on", { date: fmtDate(petition.closes_at) })}</L>
            </div>
          </div>
        </div>

        {/* Started-by + verified rate */}
        <div
          className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mt-4 text-[10.5px] font-bold uppercase tracking-[0.1em]"
          style={{
            fontFamily: "var(--font-sans-bold)",
            color: "var(--ink-soft)",
          }}
        >
          <span>
            <L>{tp("started_by_label")}</L>{" "}
            <span className="dv-text mx-1 font-bold">
              {petition.started_by_dv}
            </span>
          </span>
          <span aria-hidden>·</span>
          <span className="font-mono">
            <L>{tp("verified_short", { pct: petition.efaas_verified_pct })}</L>
          </span>
        </div>
      </article>
    </Link>
  );
}
