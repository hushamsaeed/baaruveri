import { Link } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { L } from "@/components/i18n-text";
import { budgetLines } from "@/data/budget-lines";
import { islands } from "@/data/islands";

export const metadata = {
  title: "Open data — Baaruveri",
  description:
    "Every aggregate Baaruveri publishes is downloadable as CSV + JSON. v0 dataset: council budgets.",
};

export default async function DatasetsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DatasetsContent />;
}

function DatasetsContent() {
  const t = useTranslations("datasets");
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
          <p
            className="max-w-2xl text-base text-muted-foreground leading-relaxed [&_em]:not-italic [&_em]:text-foreground [&_em]:font-medium"
            dangerouslySetInnerHTML={{ __html: t("lede") }}
          />
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
            <div
              className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground mb-3 [&_code]:bg-muted [&_code]:px-1"
              dangerouslySetInnerHTML={{ __html: t("filter_heading") }}
            />
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
