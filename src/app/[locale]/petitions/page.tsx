import { setRequestLocale, getTranslations } from "next-intl/server";
import { listPetitions } from "@/db/queries/petitions";
import { PetitionListItem } from "@/components/petition-list-item";
import { L } from "@/components/i18n-text";

export const metadata = {
  title: "Petitions — Baaruveri",
  description:
    "Threshold-triggered petitions to councils and parliament. Sign with eFaas.",
};

export const dynamic = "force-dynamic";

export default async function PetitionsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "petitions_index" });

  const petitions = await listPetitions();
  const totalSigs = petitions.reduce((s, p) => s + p.signatures, 0);
  const sorted = [...petitions].sort((a, b) => {
    // National first, then by signature count descending
    if (a.scope !== b.scope) return a.scope === "national" ? -1 : 1;
    return b.signatures - a.signatures;
  });

  return (
    <main className="flex-1">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-12">
          <div className="text-[11px] text-muted-foreground uppercase tracking-[0.14em] mb-3 font-mono">
            <L>{t("subtitle")}</L>
          </div>
          {/* Bilingual title flourish — Dhivehi + English side-by-side
              regardless of locale, matching the v3.2-3 hero treatment. */}
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            <span className="dv-text me-3 font-bold">ޕެޓިޝަންތައް</span>
            <span>Open petitions</span>
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
            <L>
              {t.rich("lede", {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </L>
          </p>
          <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-4 font-mono text-sm">
            <div>
              <dt className="text-[10px] text-muted-foreground uppercase tracking-[0.1em]">
                <L>{t("stat_open")}</L>
              </dt>
              <dd className="num text-lg mt-0.5">{petitions.length}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-muted-foreground uppercase tracking-[0.1em]">
                <L>{t("stat_total_signatures")}</L>
              </dt>
              <dd className="num text-lg mt-0.5">
                {totalSigs.toLocaleString("en-US")}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] text-muted-foreground uppercase tracking-[0.1em]">
                <L>{t("stat_national")}</L>
              </dt>
              <dd className="num text-lg mt-0.5">
                {petitions.filter((p) => p.scope === "national").length}
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-10">
        <ul className="grid gap-4 lg:grid-cols-2">
          {sorted.map((p) => (
            <li key={p.id}>
              <PetitionListItem petition={p} />
            </li>
          ))}
        </ul>

        <p className="mt-12 pt-6 border-t border-border text-[11px] text-muted-foreground leading-relaxed max-w-2xl">
          <L>{t("footnote")}</L>
        </p>
      </section>
    </main>
  );
}
