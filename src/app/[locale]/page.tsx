import { Link } from "@/i18n/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { listIslands } from "@/db/queries/islands";
import { listThreads } from "@/db/queries/threads";
import { listPetitions } from "@/db/queries/petitions";
import { getTotalSessionSignatures } from "@/db/queries/signatures";
import { HERO_THREAD_ID } from "@/db/queries/claims";
import { L } from "@/components/i18n-text";
import type { Island } from "@/lib/types";

// Direction X (live data ribbon + atlas row + featured activity) per
// huashu-design pass. All sections are server-rendered against live DB
// data — first impression accurately reflects what's in the platform.

export const dynamic = "force-dynamic";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [islands, threads, petitions, sessionSignatures, t, tn] =
    await Promise.all([
      listIslands(),
      listThreads(),
      listPetitions(),
      getTotalSessionSignatures(),
      getTranslations({ locale, namespace: "home" }),
      getTranslations({ locale, namespace: "nav" }),
    ]);

  // Featured island row: first 3 islands. Skip Maafaru (it's already the
  // hero thread referenced in the activity row below) so the homepage
  // doesn't double-feature the same island.
  const featuredIslands = islands
    .filter((i) => i.slug !== "maafaru")
    .slice(0, 3);

  // Featured thread: the canonical hero (Maafaru airport).
  const featuredThread =
    threads.find((th) => th.id === HERO_THREAD_ID) ?? threads[0];

  // Featured petition: highest seeded baseline (the most-active one).
  const featuredPetition = [...petitions].sort(
    (a, b) => b.signatures - a.signatures
  )[0];

  return (
    <main className="flex flex-1 flex-col">
      {/* Hero block */}
      <section className="px-6 sm:px-10 pt-20 sm:pt-24 pb-10 sm:pb-14 max-w-5xl mx-auto w-full">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-mono mb-5">
          <span className="dv-text">ބާރުވެރި</span>
          <span> · Baaruveri · Concept prototype</span>
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05] mb-6 max-w-3xl">
          {locale === "dv" ? (
            <span className="dv-text">{t("tagline")}</span>
          ) : (
            t("tagline")
          )}
        </h1>
        <p className="max-w-2xl text-base sm:text-[17px] text-muted-foreground leading-relaxed mb-9">
          {locale === "dv" ? (
            <span className="dv-text">{t("lede")}</span>
          ) : (
            t("lede")
          )}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/atlas"
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {locale === "dv" ? (
              <span className="dv-text">{tn("open_atlas")}</span>
            ) : (
              tn("open_atlas")
            )}
          </Link>
          <Link
            href="/sandbar"
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium border border-border text-foreground hover:bg-secondary transition-colors"
          >
            {locale === "dv" ? (
              <span className="dv-text">{tn("go_to_sandbar")}</span>
            ) : (
              tn("go_to_sandbar")
            )}
          </Link>
        </div>
      </section>

      {/* Live data ribbon */}
      <section className="border-y border-border bg-muted/30">
        <div className="px-6 sm:px-10 py-5 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-2 text-[10.5px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-3">
            <span className="live-dot" />
            <L>{t("ribbon_eyebrow")}</L>
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 font-mono tabular-nums text-[13px]">
            <RibbonStat
              value={islands.length}
              label={t("ribbon_islands", { count: islands.length })}
            />
            <RibbonStat
              value={threads.length}
              label={t("ribbon_threads", { count: threads.length })}
            />
            <RibbonStat
              value={petitions.length}
              label={t("ribbon_petitions", { count: petitions.length })}
            />
            <RibbonStat
              value={sessionSignatures}
              label={t("ribbon_signatures", { count: sessionSignatures })}
              showLabel={false}
              fullLabel={t("ribbon_signatures", { count: sessionSignatures })}
            />
          </ul>
        </div>
      </section>

      {/* Explore by island */}
      <section className="px-6 sm:px-10 py-12 max-w-5xl mx-auto w-full">
        <SectionHeader
          number="01"
          label={t("explore_section_label")}
          meta={t("explore_section_meta")}
        />
        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          {featuredIslands.map((island) => (
            <IslandCard key={island.id} island={island} cta={t("explore_card_open")} />
          ))}
        </div>
      </section>

      {/* Current activity */}
      <section className="px-6 sm:px-10 pb-20 max-w-5xl mx-auto w-full">
        <SectionHeader
          number="02"
          label={t("activity_section_label")}
          meta={t("activity_section_meta")}
        />
        <div className="grid sm:grid-cols-2 gap-5 mt-6">
          {featuredThread && (
            <article className="bg-card border border-border p-5 flex flex-col">
              <div className="text-[10.5px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-3">
                <L>{t("activity_thread_label")}</L>
              </div>
              <h3 className="font-semibold text-[15px] leading-snug mb-2">
                <span className="dv-text">{featuredThread.title_dv}</span>
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed mb-4 flex-1">
                {featuredThread.title_en}
              </p>
              <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground tabular-nums mb-3">
                <span>
                  <span className="text-foreground font-semibold">
                    {featuredThread.claim_count}
                  </span>{" "}
                  claims
                </span>
                <span>·</span>
                <span>
                  <span className="text-foreground font-semibold">
                    {featuredThread.reply_count}
                  </span>{" "}
                  replies
                </span>
                <span>·</span>
                <span>
                  <span className="text-foreground font-semibold">
                    {featuredThread.vote_count}
                  </span>{" "}
                  votes
                </span>
              </div>
              <Link
                href={`/sandbar/${featuredThread.id}`}
                className="text-[13px] text-primary hover:underline font-mono"
              >
                <L>{t("open_thread")}</L>
              </Link>
            </article>
          )}
          {featuredPetition && (
            <article className="bg-card border border-border p-5 flex flex-col">
              <div className="text-[10.5px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-3">
                <L>{t("activity_petition_label")}</L>
              </div>
              <h3 className="font-semibold text-[15px] leading-snug mb-2">
                <span className="dv-text">{featuredPetition.title_dv}</span>
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed mb-4 flex-1">
                {featuredPetition.title_en}
              </p>
              <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground tabular-nums mb-3">
                <span>
                  <span className="text-foreground font-semibold">
                    {featuredPetition.signatures.toLocaleString("en-US")}
                  </span>{" "}
                  / {featuredPetition.threshold.toLocaleString("en-US")}
                </span>
                <span>·</span>
                <span>
                  <span className="text-foreground font-semibold">
                    {Math.round(
                      (featuredPetition.signatures / featuredPetition.threshold) * 100
                    )}
                    %
                  </span>{" "}
                  of threshold
                </span>
              </div>
              <Link
                href={`/petitions/${featuredPetition.id}`}
                className="text-[13px] text-primary hover:underline font-mono"
              >
                <L>{t("open_petition")}</L>
              </Link>
            </article>
          )}
        </div>
      </section>

      {/* What is this */}
      <section className="px-6 sm:px-10 pb-24 max-w-5xl mx-auto w-full">
        <div className="border-t border-border pt-8 max-w-3xl">
          <div className="text-[10.5px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-3">
            <L>{t("what_is_label")}</L>
          </div>
          <p className="text-[14px] leading-relaxed text-muted-foreground">
            {locale === "dv" ? (
              <span className="dv-text">{t("what_is_body")}</span>
            ) : (
              t("what_is_body")
            )}
          </p>
        </div>
      </section>
    </main>
  );
}

function SectionHeader({
  number,
  label,
  meta,
}: {
  number: string;
  label: string;
  meta: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 flex-wrap">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[10.5px] text-muted-foreground tracking-[0.12em]">
          {number}
        </span>
        <h2 className="font-mono text-[12px] uppercase tracking-[0.14em] font-semibold">
          <L>{label}</L>
        </h2>
      </div>
      <span className="font-mono text-[11px] text-muted-foreground">
        <L>{meta}</L>
      </span>
    </div>
  );
}

function RibbonStat({
  value,
  label,
  showLabel = true,
  fullLabel,
}: {
  value: number;
  label: string;
  showLabel?: boolean;
  fullLabel?: string;
}) {
  // For the signatures stat the ICU template already embeds the count, so
  // we render the full templated string instead of "value · label".
  if (!showLabel && fullLabel) {
    return (
      <li className="flex items-baseline gap-2">
        <span className="text-foreground">{fullLabel}</span>
      </li>
    );
  }
  // For islands/threads/petitions the label already includes the count via
  // ICU plural; we just render it.
  return (
    <li className="flex items-baseline gap-2">
      <span className="text-foreground">{label}</span>
      <span className="text-muted-foreground/60 sr-only">{value}</span>
    </li>
  );
}

function IslandCard({
  island,
  cta,
}: {
  island: Island;
  cta: string;
}) {
  return (
    <Link
      href={`/atlas/${island.slug}`}
      className="group bg-card border border-border p-4 flex flex-col hover:border-primary transition-colors"
    >
      <div className="flex items-baseline justify-between mb-2 text-[10.5px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
        <span className="dv-text text-[12.5px] normal-case tracking-normal">
          {island.atoll_dv}
        </span>
        <span>{island.atoll_code}</span>
      </div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="dv-text text-[18px] font-semibold">
          {island.name_dv}
        </span>
        <span className="text-[14px] text-muted-foreground">{island.name_en}</span>
      </div>
      <ul className="space-y-1 text-[12px] font-mono tabular-nums text-muted-foreground flex-1">
        <li className="flex justify-between">
          <span>population</span>
          <span className="text-foreground">{island.population.toLocaleString("en-US")}</span>
        </li>
        <li className="flex justify-between">
          <span>active threads</span>
          <span className="text-foreground">{island.active_threads}</span>
        </li>
      </ul>
      <span className="mt-3 text-[12px] text-primary group-hover:underline font-mono">
        {cta}
      </span>
    </Link>
  );
}
