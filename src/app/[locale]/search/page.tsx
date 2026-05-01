import { Link } from "@/i18n/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { search } from "@/db/queries/search";
import { L } from "@/components/i18n-text";

// Direction X (linear list page) per huashu-design pass — full-results
// extension of the dropdown affordance. Uncapped via the search()
// query's optional limit (overridable up to MAX_LIMIT_PER_SECTION = 100).

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps) {
  const { q } = await searchParams;
  return {
    title: q ? `Search · ${q} — Baaruveri` : "Search — Baaruveri",
    description: "Search islands, threads, and petitions across Baaruveri.",
  };
}

export default async function SearchPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { q: rawQ } = await searchParams;
  const q = (rawQ ?? "").trim();
  const t = await getTranslations({ locale, namespace: "search" });

  const results = q.length >= 2 ? await search(q, { limitPerSection: 100 }) : null;

  return (
    <main className="flex-1">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 py-12">
          <div className="text-[11px] text-muted-foreground uppercase tracking-[0.14em] mb-3 font-mono">
            <L>{t("page_subtitle")}</L>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            {q ? <L>{t("page_title_for", { q })}</L> : <L>{t("page_title_empty")}</L>}
          </h1>
          {results && (
            <p className="text-[13px] text-muted-foreground font-mono tabular-nums">
              {results.totalCount === 0 ? (
                <L>{t("no_results", { q })}</L>
              ) : (
                <L>
                  {t("page_count_meta", {
                    total: results.totalCount,
                    islands: results.islands.length,
                    threads: results.threads.length,
                    petitions: results.petitions.length,
                  })}
                </L>
              )}
            </p>
          )}
          {!results && (
            <p className="text-[13px] text-muted-foreground italic">
              <L>{t("page_empty_hint")}</L>
            </p>
          )}
        </div>
      </header>

      {results && results.totalCount > 0 && (
        <section className="max-w-4xl mx-auto px-6 sm:px-10 py-10 space-y-12">
          {results.islands.length > 0 && (
            <ResultGroup
              label={t("group_islands")}
              count={results.islands.length}
            >
              <ul className="divide-y divide-border border-y border-border">
                {results.islands.map((h) => (
                  <li key={h.id}>
                    <Link
                      href={`/atlas/${h.slug}`}
                      className="block px-2 py-3 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-baseline gap-3">
                        <span className="dv-text text-[15px] font-semibold">
                          {h.name_dv}
                        </span>
                        <span className="text-[15px]">{h.name_en}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono uppercase tracking-[0.1em] mt-1">
                        {h.atoll_en} Atoll · /atlas/{h.slug}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </ResultGroup>
          )}
          {results.threads.length > 0 && (
            <ResultGroup
              label={t("group_threads")}
              count={results.threads.length}
            >
              <ul className="divide-y divide-border border-y border-border">
                {results.threads.map((h) => (
                  <li key={h.id}>
                    <Link
                      href={`/sandbar/${h.id}`}
                      className="block px-2 py-3 hover:bg-muted/40 transition-colors"
                    >
                      <div className="text-[15px] leading-snug">{h.title_en}</div>
                      <div className="dv-text text-[13px] text-foreground/70 mt-1">
                        {h.title_dv}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono uppercase tracking-[0.1em] mt-2">
                        {h.issue} · /sandbar/{h.id}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </ResultGroup>
          )}
          {results.petitions.length > 0 && (
            <ResultGroup
              label={t("group_petitions")}
              count={results.petitions.length}
            >
              <ul className="divide-y divide-border border-y border-border">
                {results.petitions.map((h) => (
                  <li key={h.id}>
                    <Link
                      href={`/petitions/${h.id}`}
                      className="block px-2 py-3 hover:bg-muted/40 transition-colors"
                    >
                      <div className="text-[15px] leading-snug">{h.title_en}</div>
                      <div className="dv-text text-[13px] text-foreground/70 mt-1">
                        {h.title_dv}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono uppercase tracking-[0.1em] mt-2">
                        {h.scope} · /petitions/{h.id}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </ResultGroup>
          )}
        </section>
      )}

      <section className="max-w-4xl mx-auto px-6 sm:px-10 pb-20 pt-8">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          <L>{t("page_footnote")}</L>
        </p>
      </section>
    </main>
  );
}

function ResultGroup({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-mono text-[12px] uppercase tracking-[0.14em] font-semibold">
          <L>{label}</L>
        </h2>
        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
          {count}
        </span>
      </div>
      {children}
    </div>
  );
}
