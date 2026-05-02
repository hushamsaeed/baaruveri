import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { getIsland } from "@/db/queries/islands";
import { getBudgetLines } from "@/db/queries/budgets";
import { getCouncilMembers } from "@/db/queries/council";
import { getThreadsForIsland } from "@/db/queries/threads";
import { getPetitionsForIsland } from "@/db/queries/petitions";
import { IslandProfileHeader } from "@/components/island-profile-header";
import { BudgetTable } from "@/components/budget-table";
import { ThreadListItem } from "@/components/thread-list-item";
import { PetitionListItem } from "@/components/petition-list-item";
import { L } from "@/components/i18n-text";
import type { Island, BudgetLine, CouncilMember, Thread, Petition } from "@/lib/types";

// Per-island profile changes when council/budget data refreshes — quarterly
// for budgets, after elections for council, otherwise rarely. 60s revalidate
// is generous; thread/petition counts are denormalised counters and the live
// civic-data sidebar runs on its own component fetches.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const island = await getIsland(slug);
  if (!island) return { title: "Not found — Baaruveri" };
  return {
    title: `${island.name_en} — Atlas — Baaruveri`,
    description: island.context_en,
  };
}

interface SectionLabelProps {
  number: string;
  label: string;
  meta?: string;
}

// Vignelli civic-press section header — Archivo Black ordinal block
// + Archivo 700 caps title (spec §3 + §7.6 ledger headers).
function SectionLabel({ number, label, meta }: SectionLabelProps) {
  return (
    <div
      className="flex items-baseline justify-between mb-6 gap-4 flex-wrap pb-2"
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
      </div>
      {meta && (
        <span
          className="font-mono text-[10.5px] uppercase tracking-[0.1em]"
          style={{ color: "var(--ink-soft)" }}
        >
          <L>{meta}</L>
        </span>
      )}
    </div>
  );
}

export default async function IslandProfilePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const island = await getIsland(slug);
  if (!island) notFound();

  const [budgetLines, council, threads, petitions] = await Promise.all([
    getBudgetLines(island.id),
    getCouncilMembers(island.id),
    getThreadsForIsland(island.id),
    getPetitionsForIsland(island.id),
  ]);

  return (
    <ProfileBody
      island={island}
      council={council}
      budgetLines={budgetLines}
      threads={threads}
      petitions={petitions}
    />
  );
}

function ProfileBody({
  island,
  council,
  budgetLines,
  threads,
  petitions,
}: {
  island: Island;
  council: CouncilMember[];
  budgetLines: BudgetLine[];
  threads: Thread[];
  petitions: Petition[];
}) {
  const t = useTranslations("island");
  return (
    <main className="flex-1">
      <IslandProfileHeader island={island} />

      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        {/* COUNCIL */}
        <section className="py-10" style={{ borderBottom: "1px solid var(--ink)" }}>
          <SectionLabel
            number="01"
            label={t("section_council")}
            meta={
              island.council_seats > 0
                ? t("section_council_meta_seats", {
                    shown: council.length,
                    total: island.council_seats,
                  })
                : t("section_council_meta_hdc")
            }
          />
          {/* Council members per spec §5 identity tiers — verified-public
              · council renders on a vignelli-green block with paper text. */}
          <ul className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3">
            {council.map((m) => (
              <li
                key={m.id}
                className="p-4"
                style={{
                  background: "var(--vignelli-green)",
                  color: "var(--paper)",
                  borderInlineEnd: "1px solid var(--paper)",
                  borderBottom: "1px solid var(--paper)",
                }}
              >
                <div className="flex items-baseline justify-between mb-2">
                  <span
                    className="text-[9.5px] uppercase font-bold tracking-[0.12em]"
                    style={{ fontFamily: "var(--font-sans-bold)" }}
                  >
                    {m.role_en}
                  </span>
                  <span
                    className="font-mono text-[10px] tracking-[0.1em]"
                    style={{ opacity: 0.85 }}
                  >
                    {m.party}
                  </span>
                </div>
                <div className="dv-text font-bold text-[20px] leading-none">
                  {m.name_dv}
                </div>
                <div
                  className="font-display text-[15px] mt-1.5"
                  style={{
                    fontFamily: "var(--font-display), sans-serif",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    textTransform: "uppercase",
                  }}
                >
                  {m.name_en}
                </div>
                {m.ward_en && (
                  <div
                    className="font-mono text-[10px] uppercase tracking-[0.12em] mt-1.5"
                    style={{ opacity: 0.85 }}
                  >
                    {m.ward_en}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* BUDGET */}
        <section className="py-10" style={{ borderBottom: "1px solid var(--ink)" }}>
          <SectionLabel
            number="02"
            label={t("section_budget")}
            meta={t("section_budget_meta")}
          />
          {budgetLines.length > 0 ? (
            <BudgetTable lines={budgetLines} islandSlug={island.slug} />
          ) : (
            <p
              className="font-mono text-[11px] uppercase tracking-[0.1em]"
              style={{ color: "var(--ink-soft)" }}
            >
              <L>{t("budget_feed_not_wired")}</L>
            </p>
          )}
        </section>

        {/* THREADS */}
        <section className="py-10" style={{ borderBottom: "1px solid var(--ink)" }}>
          <SectionLabel
            number="03"
            label={t("section_threads")}
            meta={t("section_threads_meta", {
              total: island.active_threads,
              shown: threads.length,
            })}
          />
          <ul className="grid gap-4">
            {threads.map((th) => (
              <li key={th.id}>
                <ThreadListItem thread={th} />
              </li>
            ))}
          </ul>
        </section>

        {/* PETITIONS */}
        <section className="py-10" style={{ borderBottom: "1px solid var(--ink)" }}>
          <SectionLabel
            number="04"
            label={t("section_petitions")}
            meta={t("section_petitions_meta", { count: petitions.length })}
          />
          <ul className="grid gap-4">
            {petitions.map((p) => (
              <li key={p.id}>
                <PetitionListItem petition={p} />
              </li>
            ))}
          </ul>
        </section>

        {/* FOOTER */}
        <section className="py-8">
          <p
            className="font-mono text-[10.5px] leading-[1.6] max-w-3xl"
            style={{ color: "var(--ink-soft)" }}
          >
            <L>
              {t("footnote", {
                pop_label: island.population_source.label,
                pop_year: island.population_source.year,
                voter_label: island.voters_source.label,
                voter_date: island.voters_source.date,
              })}
            </L>
          </p>
        </section>
      </div>
    </main>
  );
}
