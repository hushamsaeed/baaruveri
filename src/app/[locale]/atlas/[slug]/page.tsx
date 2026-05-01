import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { islands, getIsland } from "@/data/islands";
import { getBudgetLines } from "@/data/budget-lines";
import { getCouncilMembers } from "@/data/council-members";
import { getThreadsForIsland } from "@/data/threads";
import { getPetitionsForIsland } from "@/data/petitions";
import { IslandProfileHeader } from "@/components/island-profile-header";
import { BudgetTable } from "@/components/budget-table";
import { ThreadListItem } from "@/components/thread-list-item";
import { PetitionListItem } from "@/components/petition-list-item";
import { L } from "@/components/i18n-text";
import { routing } from "@/i18n/routing";
import type { Island, BudgetLine, CouncilMember, Thread, Petition } from "@/lib/types";

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    islands.map((i) => ({ locale, slug: i.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const island = getIsland(slug);
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

function SectionLabel({ number, label, meta }: SectionLabelProps) {
  return (
    <div className="flex items-baseline justify-between mb-6 gap-4 flex-wrap">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[10.5px] text-muted-foreground tracking-[0.12em]">
          {number}
        </span>
        <h2 className="font-mono text-[12px] uppercase tracking-[0.14em] font-semibold">
          <L>{label}</L>
        </h2>
      </div>
      {meta && (
        <span className="font-mono text-[11px] text-muted-foreground"><L>{meta}</L></span>
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
  const island = getIsland(slug);
  if (!island) notFound();

  const budgetLines = getBudgetLines(island.id);
  const council = getCouncilMembers(island.id);
  const threads = getThreadsForIsland(island.id);
  const petitions = getPetitionsForIsland(island.id);

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

      <div className="max-w-6xl mx-auto px-6 sm:px-10 divide-y divide-border">
        {/* COUNCIL */}
        <section className="py-12">
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
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {council.map((m) => (
              <li
                key={m.id}
                className="bg-card border border-border p-4"
              >
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {m.role_en}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {m.party}
                  </span>
                </div>
                <div className="text-[15px] font-semibold leading-tight">
                  <span className="dv-text">{m.name_dv}</span>
                </div>
                <div className="text-[12px] text-muted-foreground mt-0.5">
                  {m.name_en}
                  {m.ward_en ? ` · ${m.ward_en}` : ""}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* BUDGET */}
        <section className="py-12">
          <SectionLabel
            number="02"
            label={t("section_budget")}
            meta={t("section_budget_meta")}
          />
          {budgetLines.length > 0 ? (
            <BudgetTable lines={budgetLines} islandSlug={island.slug} />
          ) : (
            <p className="text-[13px] text-muted-foreground">
              Budget feed not yet wired for this island.
            </p>
          )}
        </section>

        {/* THREADS */}
        <section className="py-12">
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
        <section className="py-12">
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
        <section className="py-10">
          <p className="text-[11px] text-muted-foreground leading-relaxed max-w-3xl">
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
