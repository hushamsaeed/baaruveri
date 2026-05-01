import { setRequestLocale, getTranslations } from "next-intl/server";
import { ThreadListItem } from "@/components/thread-list-item";
import { L } from "@/components/i18n-text";
import { listThreads } from "@/db/queries/threads";
import type { IssueTag } from "@/lib/types";

export const metadata = {
  title: "Sandbar — Baaruveri",
  description:
    "Threaded civic debate by issue and island. Verified and anonymous tiers.",
};

// Thread list updates when a new thread is started — infrequent. 60s
// revalidate is a fair compromise between freshness and DB load. The
// per-thread vote/reply counters are denormalised so the list view shows
// up-to-the-minute activity from the moment of revalidation.
export const revalidate = 60;

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
  const [t, ti, threads] = await Promise.all([
    getTranslations("sandbar"),
    getTranslations("issue"),
    listThreads(),
  ]);
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

// Defensive: marker so the rest of the file is the page above (no inner helper anymore).
