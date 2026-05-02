import { useTranslations } from "next-intl";
import { L } from "./i18n-text";
import type { BudgetLine } from "@/lib/types";

// Vignelli civic-press budget table — flush to the page (no rounded
// card surface), 2px ink top border, hairline ink dividers, and the
// row-total emphasis swapped from a tinted bg to bold ink rule.
// YoY delta sign-coding now uses vignelli-red for over and
// vignelli-green for under (from spec §4 lane palette).

interface BudgetTableProps {
  lines: BudgetLine[];
  islandSlug: string;
}

function fmtMvr(n: number): string {
  return n.toLocaleString("en-US");
}

function fmtPct(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}`;
}

export function BudgetTable({ lines, islandSlug }: BudgetTableProps) {
  const tb = useTranslations("budget_table");
  if (lines.length === 0) return null;
  const totalAlloc = lines.reduce((s, l) => s + l.allocated_mvr, 0);
  const totalSpent = lines.reduce((s, l) => s + l.spent_mvr, 0);
  const totalPctSpent = totalAlloc ? (totalSpent / totalAlloc) * 100 : 0;
  const weightedYoy =
    lines.reduce((s, l) => s + l.yoy_pct * l.allocated_mvr, 0) /
    Math.max(totalAlloc, 1);

  const headStyle = {
    fontFamily: "var(--font-sans-bold)",
    color: "var(--ink-soft)",
  };

  return (
    <div>
      <table className="w-full text-[13px] border-collapse">
        <thead>
          <tr style={{ borderBottom: "2px solid var(--ink)" }}>
            <th
              className="text-start pb-2 pe-3 text-[10px] uppercase font-bold tracking-[0.12em]"
              style={headStyle}
            >
              <L>{tb("col_line_item")}</L>
            </th>
            <th
              className="text-right pb-2 px-3 text-[10px] uppercase font-bold tracking-[0.12em] font-mono"
              style={headStyle}
            >
              <L>{tb("col_allocated")}</L>
            </th>
            <th
              className="text-right pb-2 px-3 text-[10px] uppercase font-bold tracking-[0.12em] font-mono"
              style={headStyle}
            >
              <L>{tb("col_spent")}</L>
            </th>
            <th
              className="text-right pb-2 px-3 text-[10px] uppercase font-bold tracking-[0.12em] font-mono"
              style={headStyle}
            >
              <L>{tb("col_pct_spent")}</L>
            </th>
            <th
              className="text-right pb-2 ps-3 text-[10px] uppercase font-bold tracking-[0.12em] font-mono"
              style={headStyle}
            >
              <L>{tb("col_yoy")}</L>
            </th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => {
            const pctSpent = line.allocated_mvr
              ? (line.spent_mvr / line.allocated_mvr) * 100
              : 0;
            const yoyColor =
              line.yoy_pct > 5
                ? "var(--vignelli-red)"
                : line.yoy_pct < -1
                  ? "var(--vignelli-green)"
                  : "var(--ink)";
            return (
              <tr
                key={`${line.island_id}-${line.line_item_en}`}
                style={{ borderBottom: "1px solid var(--paper-rule)" }}
              >
                <td className="py-2 pe-3">
                  <span className="dv-text me-2 font-bold">
                    {line.line_item_dv}
                  </span>
                  <span style={{ color: "var(--ink-soft)" }}>
                    · {line.line_item_en}
                  </span>
                </td>
                <td className="py-2 px-3 text-right font-mono tabular-nums">
                  {fmtMvr(line.allocated_mvr)}
                </td>
                <td className="py-2 px-3 text-right font-mono tabular-nums">
                  {fmtMvr(line.spent_mvr)}
                </td>
                <td className="py-2 px-3 text-right font-mono tabular-nums">
                  {pctSpent.toFixed(1)}%
                </td>
                <td
                  className="py-2 ps-3 text-right font-mono tabular-nums font-bold"
                  style={{ color: yoyColor }}
                >
                  {fmtPct(line.yoy_pct)}%
                </td>
              </tr>
            );
          })}
          <tr style={{ borderTop: "2px solid var(--ink)" }}>
            <td
              className="py-2.5 pe-3 text-[10px] uppercase font-bold tracking-[0.12em]"
              style={{ fontFamily: "var(--font-sans-bold)" }}
            >
              <L>{tb("row_total")}</L>
            </td>
            <td
              className="py-2.5 px-3 text-right font-display text-[18px] tabular-nums"
              style={{
                fontFamily: "var(--font-display), sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              {fmtMvr(totalAlloc)}
            </td>
            <td
              className="py-2.5 px-3 text-right font-display text-[18px] tabular-nums"
              style={{
                fontFamily: "var(--font-display), sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              {fmtMvr(totalSpent)}
            </td>
            <td
              className="py-2.5 px-3 text-right font-display text-[18px] tabular-nums"
              style={{
                fontFamily: "var(--font-display), sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              {totalPctSpent.toFixed(1)}%
            </td>
            <td
              className="py-2.5 ps-3 text-right font-display text-[18px] tabular-nums"
              style={{
                fontFamily: "var(--font-display), sans-serif",
                letterSpacing: "-0.02em",
                color:
                  weightedYoy > 5
                    ? "var(--vignelli-red)"
                    : weightedYoy < -1
                      ? "var(--vignelli-green)"
                      : "var(--ink)",
              }}
            >
              {fmtPct(weightedYoy)}%
            </td>
          </tr>
        </tbody>
      </table>
      <div
        className="flex flex-col sm:flex-row sm:justify-between gap-3 mt-3 pt-3 text-[10.5px]"
        style={{
          borderTop: "1px solid var(--paper-rule)",
          color: "var(--ink-soft)",
        }}
      >
        <span className="font-mono uppercase tracking-[0.08em]">
          <L>{tb("source_note")}</L>
        </span>
        <span
          className="font-bold uppercase tracking-[0.1em]"
          style={{ fontFamily: "var(--font-sans-bold)" }}
        >
          <L>{tb("open_data_label")}</L>:{" "}
          <a
            className="hover:underline underline-offset-2"
            style={{ color: "var(--vignelli-red)" }}
            href={`/api/v1/budgets?island=${islandSlug}`}
          >
            {tb("json_link")}
          </a>
          {" · "}
          <a
            className="hover:underline underline-offset-2"
            style={{ color: "var(--vignelli-red)" }}
            href={`/datasets/budgets.csv?island=${islandSlug}`}
          >
            {tb("csv_link")}
          </a>
        </span>
      </div>
    </div>
  );
}
