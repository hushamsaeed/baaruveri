import { ThreadListItem } from "@/components/thread-list-item";
import { threads } from "@/data/threads";
import type { IssueTag } from "@/lib/types";

export const metadata = {
  title: "Sandbar — Baaruveri",
  description:
    "Threaded civic debate by issue and island. Verified and anonymous tiers.",
};

const ISSUE_TAGS: { tag: IssueTag; en: string; dv: string }[] = [
  { tag: "housing", en: "Housing", dv: "ހައުސިން" },
  { tag: "climate", en: "Climate", dv: "މޫސުމީ" },
  { tag: "judiciary", en: "Judiciary", dv: "ޝަރުޢީ" },
  { tag: "fisheries", en: "Fisheries", dv: "މަސްވެރިކަން" },
  { tag: "education", en: "Education", dv: "ތަޢުލީމް" },
  { tag: "decentralisation", en: "Decentralisation", dv: "ލާމަރުކަޒު" },
  { tag: "procurement", en: "Procurement", dv: "ޚަރީދު" },
];

export default function SandbarHomePage() {
  const totalReplies = threads.reduce((s, t) => s + t.reply_count, 0);
  const totalClaims = threads.reduce((s, t) => s + t.claim_count, 0);

  // Sort newest first
  const sorted = [...threads].sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  );

  return (
    <main className="flex-1">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-12">
          <div className="text-[11px] text-muted-foreground uppercase tracking-[0.14em] mb-3 font-mono">
            Sandbar · v0 prototype
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            <span className="dv-text me-3 font-bold">ސޭންޑްބާރ</span>
            <span>Threaded debate by issue × island</span>
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
            A space for citizens, journalists, and councils to argue claims with
            sources, side by side. Anonymous tier for everyday speech;
            eFaas-verified tier for high-stakes acts. Civic-data sidebar attaches
            relevant per-island context to every thread.
          </p>
          <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-4 font-mono text-sm">
            <div>
              <dt className="text-[10px] text-muted-foreground uppercase tracking-[0.1em]">
                Active threads
              </dt>
              <dd className="num text-lg mt-0.5">{threads.length}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-muted-foreground uppercase tracking-[0.1em]">
                Replies
              </dt>
              <dd className="num text-lg mt-0.5">{totalReplies}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-muted-foreground uppercase tracking-[0.1em]">
                Claims
              </dt>
              <dd className="num text-lg mt-0.5">{totalClaims}</dd>
            </div>
          </dl>
        </div>
      </header>

      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-6">
          <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-mono mb-3">
            Filter by issue (v0: visual only)
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="bg-foreground text-background px-3 py-1 text-[12px] font-mono">
              All
            </span>
            {ISSUE_TAGS.map((t) => (
              <span
                key={t.tag}
                className="bg-secondary text-secondary-foreground px-3 py-1 text-[12px] font-mono"
              >
                <span className="dv-text me-1.5">{t.dv}</span>
                {t.en}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-10">
        <ul className="grid gap-4 lg:grid-cols-2">
          {sorted.map((t) => (
            <li key={t.id}>
              <ThreadListItem thread={t} />
            </li>
          ))}
        </ul>

        <p className="mt-12 pt-6 border-t border-border text-[11px] text-muted-foreground leading-relaxed max-w-2xl">
          v0 hero thread is the Maafaru airport public-benefit accounting thread
          — fully wired with seven seeded claims and the civic-data sidebar.
          Other threads route to a stub page until v1.
        </p>
      </section>
    </main>
  );
}
