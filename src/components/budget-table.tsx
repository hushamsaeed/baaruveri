import type { BudgetLine } from "@/lib/types";

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
  if (lines.length === 0) return null;
  const totalAlloc = lines.reduce((s, l) => s + l.allocated_mvr, 0);
  const totalSpent = lines.reduce((s, l) => s + l.spent_mvr, 0);
  const totalPctSpent = totalAlloc ? (totalSpent / totalAlloc) * 100 : 0;
  const weightedYoy =
    lines.reduce((s, l) => s + l.yoy_pct * l.allocated_mvr, 0) /
    Math.max(totalAlloc, 1);

  return (
    <div className="bg-card border border-border p-6 sm:p-8">
      <table className="w-full text-[13px]">
        <thead>
          <tr>
            <th className="text-left pb-2 pr-3 border-b-[1.5px] border-foreground text-[10.5px] uppercase tracking-[0.08em] font-semibold text-muted-foreground">
              <span className="dv-text mr-2">ބަޖެޓު ބައި</span>
              <span>· Line item</span>
            </th>
            <th className="text-right pb-2 px-3 border-b-[1.5px] border-foreground text-[10.5px] uppercase tracking-[0.08em] font-semibold text-muted-foreground font-mono">
              Allocated (MVR)
            </th>
            <th className="text-right pb-2 px-3 border-b-[1.5px] border-foreground text-[10.5px] uppercase tracking-[0.08em] font-semibold text-muted-foreground font-mono">
              Spent Q1
            </th>
            <th className="text-right pb-2 px-3 border-b-[1.5px] border-foreground text-[10.5px] uppercase tracking-[0.08em] font-semibold text-muted-foreground font-mono">
              % spent
            </th>
            <th className="text-right pb-2 pl-3 border-b-[1.5px] border-foreground text-[10.5px] uppercase tracking-[0.08em] font-semibold text-muted-foreground font-mono">
              vs FY25 Q1
            </th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => {
            const pctSpent = line.allocated_mvr
              ? (line.spent_mvr / line.allocated_mvr) * 100
              : 0;
            return (
              <tr key={`${line.island_id}-${line.line_item_en}`} className="border-b border-border">
                <td className="py-2 pr-3">
                  <span className="dv-text mr-2">{line.line_item_dv}</span>
                  <span className="text-muted-foreground">· {line.line_item_en}</span>
                </td>
                <td className="py-2 px-3 text-right num font-mono">{fmtMvr(line.allocated_mvr)}</td>
                <td className="py-2 px-3 text-right num font-mono">{fmtMvr(line.spent_mvr)}</td>
                <td className="py-2 px-3 text-right num font-mono">{pctSpent.toFixed(1)}%</td>
                <td
                  className={`py-2 pl-3 text-right num font-mono ${
                    line.yoy_pct > 5
                      ? "text-[color:var(--over)]"
                      : line.yoy_pct < -1
                        ? "text-[color:var(--under)]"
                        : ""
                  }`}
                >
                  {fmtPct(line.yoy_pct)}%
                </td>
              </tr>
            );
          })}
          <tr className="bg-muted/40">
            <td className="py-2.5 pr-3 font-semibold">Total</td>
            <td className="py-2.5 px-3 text-right num font-mono font-semibold">{fmtMvr(totalAlloc)}</td>
            <td className="py-2.5 px-3 text-right num font-mono font-semibold">{fmtMvr(totalSpent)}</td>
            <td className="py-2.5 px-3 text-right num font-mono font-semibold">{totalPctSpent.toFixed(1)}%</td>
            <td className="py-2.5 pl-3 text-right num font-mono font-semibold">{fmtPct(weightedYoy)}%</td>
          </tr>
        </tbody>
      </table>
      <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mt-4 pt-3 border-t border-border text-[11px] text-muted-foreground">
        <span>
          Source: council quarterly return · self-reported · last sync 28 Apr 2026
        </span>
        <span className="font-mono">
          Open data:{" "}
          <a className="text-primary underline underline-offset-2" href={`/api/v1/budgets?island=${islandSlug}`}>JSON</a>
          {" · "}
          <a className="text-primary underline underline-offset-2" href={`/datasets/budgets.csv?island=${islandSlug}`}>CSV ↓</a>
        </span>
      </div>
    </div>
  );
}
