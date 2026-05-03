import { Link } from "@/i18n/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { listIslands } from "@/db/queries/islands";
import { listThreads } from "@/db/queries/threads";
import { listPetitions } from "@/db/queries/petitions";
import { getSignatureCounts } from "@/db/queries/signatures";
import { ThreadListItem } from "@/components/thread-list-item";
import { PetitionListItem } from "@/components/petition-list-item";
import { AtlasCard } from "@/components/atlas-card";
import { SideIndex } from "@/components/side-index";
import { PostingRail } from "@/components/posting-rail";
import { ComposeCTA } from "@/components/compose-cta";
import { L } from "@/components/i18n-text";

// Vignelli civic-press home — spec §6 layout grid (240px | 1fr | 280px
// on desktop ≥1024px; rails collapse below the feed at smaller widths)
// + spec §11.4 #4. The homepage is the publication's front page:
// surface actual content rather than decorative hero.
//
// Structure:
//   left rail  · SideIndex (issue taxonomy) + ComposeCTA (POST →)
//   center     · 01 hero strap → 02 topics → 03 petitions →
//                04 islands → 05 footnote
//   right rail · PostingRail (verified-citizen list, v0 stub)
//
// Below the lg breakpoint the rails are display:none. At lg+ the
// three-column grid kicks in. Spec §6 calls for outer page padding 0
// so the grid bleeds to the masthead/lane-rail edge.

export const dynamic = "force-dynamic";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [islands, threads, petitions, t, tn] = await Promise.all([
    listIslands(),
    listThreads(),
    listPetitions(),
    getTranslations({ locale, namespace: "home" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);

  const topThreads = [...threads]
    .sort(
      (a, b) =>
        b.claim_count + b.vote_count / 10 - (a.claim_count + a.vote_count / 10)
    )
    .slice(0, 4);

  const sessionCounts = await getSignatureCounts(petitions.map((p) => p.id));
  const petitionsLive = petitions.map((p) => ({
    ...p,
    signatures: p.signatures + (sessionCounts.get(p.id) ?? 0),
  }));
  const topPetitions = [...petitionsLive]
    .sort((a, b) => b.signatures - a.signatures)
    .slice(0, 3);

  const featuredIslands = islands.slice(0, 3);

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: "minmax(0, 1fr)",
        borderBottom: "2px solid var(--ink)",
      }}
    >
      <div
        className="lg:grid"
        style={{
          gridTemplateColumns: "240px minmax(0, 1fr) 280px",
        }}
      >
        {/* LEFT RAIL — side index + compose CTA */}
        <aside
          className="hidden lg:block"
          aria-label={t("side_index_aria")}
          style={{
            borderInlineEnd: "1px solid var(--ink)",
            padding: "24px 20px 32px",
          }}
        >
          <SideIndex />
          <ComposeCTA />
        </aside>

        {/* CENTER — feed */}
        <main className="flex-1">
          {/* 01 · HERO STRAP */}
          <section
            style={{
              borderBottom: "1px solid var(--ink)",
              background: "var(--paper)",
            }}
          >
            <div className="px-6 sm:px-10 py-10 sm:py-12">
              <div className="dv-text font-bold text-[36px] sm:text-[52px] leading-[1.05]">
                {t("tagline")}
              </div>
              <h1
                className="font-display text-[30px] sm:text-[44px] mt-2 max-w-[28ch]"
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  lineHeight: 0.95,
                  letterSpacing: "-0.025em",
                  textTransform: "uppercase",
                }}
              >
                {t("tagline_en")}
              </h1>
              <p
                className="mt-5 text-[15px] sm:text-[16px] leading-[1.5] max-w-[64ch]"
                style={{ color: "var(--ink)", fontWeight: 500 }}
              >
                {t("lede")}
              </p>
            </div>
          </section>

          {/* 02 · TOPICS ON SANDBAR */}
          <section style={{ borderBottom: "1px solid var(--ink)" }}>
            <div className="px-6 sm:px-10 py-8">
              <SectionLabel
                number="01"
                label={t("topics_label")}
                meta={t("topics_meta", { count: threads.length })}
                cta={{ href: "/sandbar", label: tn("go_to_sandbar") }}
              />
            </div>
            <ul>
              {topThreads.map((thread) => (
                <li key={thread.id}>
                  <ThreadListItem thread={thread} />
                </li>
              ))}
            </ul>
          </section>

          {/* 03 · OPEN PETITIONS */}
          <section style={{ borderBottom: "1px solid var(--ink)" }}>
            <div className="px-6 sm:px-10 py-8">
              <SectionLabel
                number="02"
                label={t("petitions_label")}
                meta={t("petitions_meta", { count: petitions.length })}
                cta={{ href: "/petitions", label: t("petitions_cta") }}
              />
            </div>
            <ul>
              {topPetitions.map((petition) => (
                <li key={petition.id}>
                  <PetitionListItem petition={petition} />
                </li>
              ))}
            </ul>
          </section>

          {/* 04 · PER-ISLAND PROFILES */}
          <section style={{ borderBottom: "1px solid var(--ink)" }}>
            <div className="px-6 sm:px-10 py-8">
              <SectionLabel
                number="03"
                label={t("islands_label")}
                meta={t("islands_meta", { count: islands.length })}
                cta={{ href: "/atlas", label: tn("open_atlas") }}
              />
            </div>
            <div className="px-6 sm:px-10 pb-10">
              <div className="grid gap-0 sm:grid-cols-2 xl:grid-cols-3">
                {featuredIslands.map((island) => (
                  <div key={island.id} style={{ marginInlineEnd: "-1px" }}>
                    <AtlasCard island={island} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 05 · FOOTNOTE */}
          <section className="px-6 sm:px-10 py-10">
            <div
              className="text-[10px] uppercase font-bold tracking-[0.14em] mb-3"
              style={{
                fontFamily: "var(--font-sans-bold)",
                color: "var(--ink-soft)",
              }}
            >
              <L>{t("what_is_label")}</L>
            </div>
            <p
              className="text-[14px] leading-[1.55] max-w-[64ch]"
              style={{ color: "var(--ink)" }}
            >
              {locale === "dv" ? (
                <span className="dv-text">{t("what_is_body")}</span>
              ) : (
                t("what_is_body")
              )}
            </p>
          </section>
        </main>

        {/* RIGHT RAIL — posting rail */}
        <PostingRail />
      </div>
    </div>
  );
}

function SectionLabel({
  number,
  label,
  meta,
  cta,
}: {
  number: string;
  label: string;
  meta: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div
      className="flex items-baseline justify-between gap-4 flex-wrap pb-2"
      style={{ borderBottom: "2px solid var(--ink)" }}
    >
      <div className="flex items-baseline gap-3">
        <span
          className="font-display text-[28px] sm:text-[32px] leading-none"
          style={{
            fontFamily: "var(--font-display), sans-serif",
            letterSpacing: "-0.02em",
          }}
        >
          {number}
        </span>
        <h2
          className="text-[12px] uppercase tracking-[0.14em] font-bold"
          style={{ fontFamily: "var(--font-sans-bold)" }}
        >
          <L>{label}</L>
        </h2>
        <span
          className="font-mono text-[10.5px] uppercase tracking-[0.1em]"
          style={{ color: "var(--ink-soft)" }}
        >
          <L>{meta}</L>
        </span>
      </div>
      {cta && (
        <Link
          href={cta.href}
          className="text-[11px] font-bold uppercase tracking-[0.1em] inline-flex items-baseline gap-1.5 hover:underline underline-offset-2"
          style={{
            fontFamily: "var(--font-sans-bold)",
            color: "var(--vignelli-red)",
          }}
        >
          <L>{cta.label}</L>
          <span aria-hidden className="font-mono">
            →
          </span>
        </Link>
      )}
    </div>
  );
}
