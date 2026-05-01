import { Link } from "@/i18n/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { L } from "@/components/i18n-text";
import { listBudgetLines } from "@/db/queries/budgets";
import { listIslands } from "@/db/queries/islands";

export const metadata = {
  title: "Open data — Baaruveri",
  description:
    "Every aggregate Baaruveri publishes is downloadable as CSV + JSON. v0 dataset: council budgets.",
};

export const dynamic = "force-dynamic";

export default async function DatasetsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, budgetLines, islands] = await Promise.all([
    getTranslations("datasets"),
    listBudgetLines(),
    listIslands(),
  ]);
  const totalIslands = new Set(budgetLines.map((b) => b.island_id)).size;
  const totalAllocated = budgetLines.reduce((s, l) => s + l.allocated_mvr, 0);

  return (
    <main className="flex-1">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 py-12">
          <div className="text-[11px] text-muted-foreground uppercase tracking-[0.14em] mb-3 font-mono">
            <L>{t("subtitle")}</L>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            <L>{t("title")}</L>
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
            <L>
              {t.rich("lede", {
                em: (chunks) => (
                  <em className="not-italic text-foreground font-medium">{chunks}</em>
                ),
              })}
            </L>
          </p>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 sm:px-10 py-12">
        <div className="bg-card border border-border p-6 sm:p-8">
          <div className="flex items-baseline justify-between mb-2 gap-4 flex-wrap">
            <h2 className="text-xl font-semibold">
              <L>{t("council_budgets_title")}</L>
            </h2>
            <span className="font-mono text-[11px] text-muted-foreground">
              {t("council_budgets_meta", {
                rows: budgetLines.length,
                islands: totalIslands,
              })}
            </span>
          </div>

          <p className="text-[14px] text-muted-foreground leading-relaxed mb-6">
            <L>
              {t("council_budgets_body", {
                total: totalAllocated.toLocaleString("en-US"),
              })}
            </L>
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
                · {t("csv_meta")}
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
                · {t("json_meta")}
              </span>
            </div>
          </div>

          <div className="pt-5 border-t border-border">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground mb-3">
              <L>
                {t.rich("filter_heading", {
                  code: (chunks) => (
                    <code className="bg-muted px-1">{chunks}</code>
                  ),
                })}
              </L>
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
          <L>{t("footnote")}</L>
        </p>
      </section>
    </main>
  );
}
