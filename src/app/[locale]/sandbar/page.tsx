import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { ThreadListItem } from "@/components/thread-list-item";
import { L } from "@/components/i18n-text";
import { threads } from "@/data/threads";
import type { IssueTag } from "@/lib/types";

export const metadata = {
  title: "Sandbar — Baaruveri",
  description:
    "Threaded civic debate by issue and island. Verified and anonymous tiers.",
};

const ISSUE_TAGS: IssueTag[] = [
  "housing",
  "climate",
  "judiciary",
  "fisheries",
  "education",
  "decentralisation",
  "procurement",
];

export default async function SandbarHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SandbarContent />;
}

function SandbarContent() {
  const t = useTranslations("sandbar");
  const ti = useTranslations("issue");

  const totalReplies = threads.reduce((s, x) => s + x.reply_count, 0);
  const totalClaims = threads.reduce((s, x) => s + x.claim_count, 0);
  const sorted = [...threads].sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  );

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
                <L>{t("stat_threads")}</L>
              </dt>
              <dd className="num text-lg mt-0.5">{threads.length}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-muted-foreground uppercase tracking-[0.1em]">
                <L>{t("stat_replies")}</L>
              </dt>
              <dd className="num text-lg mt-0.5">{totalReplies}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-muted-foreground uppercase tracking-[0.1em]">
                <L>{t("stat_claims")}</L>
              </dt>
              <dd className="num text-lg mt-0.5">{totalClaims}</dd>
            </div>
          </dl>
        </div>
      </header>

      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-6">
          <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-mono mb-3">
            <L>{t("filter_label")}</L>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="bg-foreground text-background px-3 py-1 text-[12px] font-mono">
              <L>{t("filter_all")}</L>
            </span>
            {ISSUE_TAGS.map((tag) => (
              <span
                key={tag}
                className="bg-secondary text-secondary-foreground px-3 py-1 text-[12px] font-mono"
              >
                <L>{ti(tag)}</L>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-10">
        <ul className="grid gap-4 lg:grid-cols-2">
          {sorted.map((th) => (
            <li key={th.id}>
              <ThreadListItem thread={th} />
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
