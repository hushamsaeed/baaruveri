import { setRequestLocale, getTranslations } from "next-intl/server";
import { AtlasCard } from "@/components/atlas-card";
import { AtollLadder } from "@/components/atoll-ladder";
import { AtlasMap } from "@/components/atlas-map";
import { L } from "@/components/i18n-text";
import { listIslands } from "@/db/queries/islands";

export const metadata = {
  title: "Atlas — Baaruveri",
  description:
    "Per-island civic profiles: council, budget, housing, climate, procurement, threads, petitions.",
};

// Atlas index changes only when staff adds an island — revalidate-60 is
// generous and bounds DB load. dynamicParams keeps SSG opt-in for the
// per-slug detail page.
export const revalidate = 60;

export default async function AtlasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, islands] = await Promise.all([
    getTranslations("atlas"),
    listIslands(),
  ]);
  const totalPop = islands.reduce((sum, i) => sum + i.population, 0);
  const totalThreads = islands.reduce((sum, i) => sum + i.active_threads, 0);
  const totalPetitions = islands.reduce((sum, i) => sum + i.active_petitions, 0);

  return (
    <main className="flex-1">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-12">
          <div className="text-[11px] text-muted-foreground uppercase tracking-[0.14em] mb-3 font-mono">
            <L>{t("subtitle")}</L>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            <L>{t("title")}</L>
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
            <L>{t("lede")}</L>
          </p>
          <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-4 font-mono text-sm">
            <div>
              <dt className="text-[10px] text-muted-foreground uppercase tracking-[0.1em]">
                <L>{t("stat_population")}</L>
              </dt>
              <dd className="num text-lg mt-0.5">
                {totalPop.toLocaleString("en-US")}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] text-muted-foreground uppercase tracking-[0.1em]">
                <L>{t("stat_threads")}</L>
              </dt>
              <dd className="num text-lg mt-0.5">{totalThreads}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-muted-foreground uppercase tracking-[0.1em]">
                <L>{t("stat_petitions")}</L>
              </dt>
              <dd className="num text-lg mt-0.5">{totalPetitions}</dd>
            </div>
          </dl>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-10 space-y-10">
        <div>
          <div className="text-[11px] text-muted-foreground uppercase tracking-[0.14em] mb-3 font-mono">
            <L>{t("map_eyebrow")}</L>
          </div>
          <AtlasMap />
          <p className="text-[11px] text-muted-foreground leading-relaxed mt-3 max-w-3xl">
            <L>{t("map_footnote")}</L>
          </p>
          {/* Fallback for users without JS — render the v3.3 schematic
              ladder so the page still surfaces the six featured islands
              with click-to-navigate. Hidden when JS is on, shown when off. */}
          <noscript>
            <div className="mt-6">
              <AtollLadder
                islands={islands}
                labels={{
                  eyebrow: t("ladder_eyebrow"),
                  n_label: t("ladder_n_label"),
                  s_label: t("ladder_s_label"),
                  footnote: t("ladder_footnote"),
                  open: t("ladder_open"),
                }}
              />
            </div>
          </noscript>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {islands.map((island) => (
            <AtlasCard key={island.id} island={island} />
          ))}
        </div>

        <p className="pt-6 border-t border-border text-[11px] text-muted-foreground leading-relaxed max-w-2xl">
          <L>{t("footnote")}</L>
        </p>
      </section>
    </main>
  );
}
