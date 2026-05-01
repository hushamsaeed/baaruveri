import { Link } from "@/i18n/navigation";
import { budgetLines } from "@/data/budget-lines";
import { islands } from "@/data/islands";

export const metadata = {
  title: "Open data — Baaruveri",
  description:
    "Every aggregate Baaruveri publishes is downloadable as CSV + JSON. v0 dataset: council budgets.",
};

export default function DatasetsIndexPage() {
  const totalIslands = new Set(budgetLines.map((b) => b.island_id)).size;
  const totalAllocated = budgetLines.reduce((s, l) => s + l.allocated_mvr, 0);

  return (
    <main className="flex-1">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 py-12">
          <div className="text-[11px] text-muted-foreground uppercase tracking-[0.14em] mb-3 font-mono">
            Open data · v0
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            <span className="dv-text mr-3 font-bold">ހުޅުވިފައި ހުރި ޑޭޓާ</span>
            <span>Open data</span>
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
            Every aggregate Baaruveri publishes is downloadable as CSV and
            queryable as JSON, no signup. Per the project commitment to{" "}
            <em>open-data parity</em>: anything you see on a dashboard view
            should be available raw, citable, and machine-readable.
          </p>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 sm:px-10 py-12">
        <div className="bg-card border border-border p-6 sm:p-8">
          <div className="flex items-baseline justify-between mb-2 gap-4 flex-wrap">
            <h2 className="text-xl font-semibold">
              <span className="dv-text mr-2">ކައުންސިލް ބަޖެޓު</span>
              <span>Council budgets</span>
            </h2>
            <span className="font-mono text-[11px] text-muted-foreground">
              FY26 Q1 · {budgetLines.length} rows · {totalIslands} islands
            </span>
          </div>

          <p className="text-[14px] text-muted-foreground leading-relaxed mb-6">
            Allocated and spent figures by line item, per island, per fiscal
            quarter. Includes year-over-year delta. Total FY26 allocation
            covered: MVR {totalAllocated.toLocaleString("en-US")}.
          </p>

          <div className="grid gap-3 mb-6">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[11px] text-muted-foreground w-16">CSV</span>
              <Link
                href="/datasets/budgets.csv"
                className="text-primary underline underline-offset-2 font-mono text-[13px]"
              >
                /datasets/budgets.csv
              </Link>
              <span className="font-mono text-[11px] text-muted-foreground">
                · UTF-8 with BOM
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[11px] text-muted-foreground w-16">JSON</span>
              <Link
                href="/api/v1/budgets"
                className="text-primary underline underline-offset-2 font-mono text-[13px]"
              >
                /api/v1/budgets
              </Link>
              <span className="font-mono text-[11px] text-muted-foreground">
                · CORS open
              </span>
            </div>
          </div>

          <div className="pt-5 border-t border-border">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground mb-3">
              Per-island filter (append <code className="bg-muted px-1">?island=&lt;slug&gt;</code>)
            </div>
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 font-mono text-[12px]">
              {islands.map((i) => (
                <li key={i.id} className="flex items-baseline gap-2">
                  <span className="text-muted-foreground">{i.slug}</span>
                  <span className="text-muted-foreground">→</span>
                  <Link
                    href={`/datasets/budgets.csv?island=${i.slug}`}
                    className="text-primary hover:underline"
                  >
                    CSV
                  </Link>
                  <span className="text-muted-foreground">·</span>
                  <Link
                    href={`/api/v1/budgets?island=${i.slug}`}
                    className="text-primary hover:underline"
                  >
                    JSON
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-12 pt-6 border-t border-border text-[11px] text-muted-foreground leading-relaxed max-w-2xl">
          Source notes · v0 figures are illustrative pending live council
          quarterly returns. Intended licence for v1: Open Database License
          (ODbL). Per-island per-issue datasets (housing, climate, EIA permits,
          procurement) follow as those primitives ship.
        </p>
      </section>
    </main>
  );
}
