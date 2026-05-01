import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { threads } from "@/data/threads";
import { getClaimsForThread, HERO_THREAD_ID } from "@/data/claims";
import { getIslandById } from "@/data/islands";
import { ClaimCard } from "@/components/claim-card";
import { CivicDataSidebar } from "@/components/civic-data-sidebar";

const ISSUE_LABELS: Record<string, string> = {
  housing: "Housing",
  climate: "Climate",
  judiciary: "Judiciary",
  fisheries: "Fisheries",
  education: "Education",
  decentralisation: "Decentralisation",
  procurement: "Procurement",
};

function relativeDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date("2026-05-01");
  const days = Math.round((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.round(days / 7)} weeks ago`;
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

import { routing } from "@/i18n/routing";

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    threads.map((t) => ({ locale, threadId: t.id }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; threadId: string }>;
}) {
  const { threadId } = await params;
  const thread = threads.find((t) => t.id === threadId);
  if (!thread) return { title: "Not found — Baaruveri" };
  return {
    title: `${thread.title_en} — Sandbar — Baaruveri`,
    description: thread.summary_en,
  };
}

export default async function ThreadDetailPage({
  params,
}: {
  params: Promise<{ locale: string; threadId: string }>;
}) {
  const { threadId } = await params;
  const thread = threads.find((t) => t.id === threadId);
  if (!thread) notFound();

  const island = thread.island_id ? getIslandById(thread.island_id) : undefined;

  const claims = getClaimsForThread(thread.id);
  const pros = claims.filter((c) => c.side === "pro");
  const cons = claims.filter((c) => c.side === "con");
  const isHero = thread.id === HERO_THREAD_ID;

  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 pt-8 pb-20">
        <Link
          href="/sandbar"
          className="inline-flex items-center text-[12px] text-muted-foreground hover:text-foreground transition-colors mb-8 font-mono"
        >
          ← Sandbar
        </Link>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
          {/* Main thread column */}
          <article>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-4 font-mono uppercase tracking-[0.1em]">
              <span className="bg-secondary text-secondary-foreground px-2 py-[2px]">
                {ISSUE_LABELS[thread.issue]}
              </span>
              {island && (
                <>
                  <span>·</span>
                  <Link href={`/atlas/${island.slug}`} className="hover:text-foreground transition-colors">
                    <span className="dv-text me-1">{island.name_dv}</span>
                    <span>{island.name_en}</span>
                  </Link>
                </>
              )}
              <span>·</span>
              <span>{relativeDate(thread.started_at)}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold leading-snug tracking-tight">
              <span className="dv-text">{thread.title_dv}</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mt-3 leading-relaxed">
              {thread.title_en}
            </p>
            <p className="text-[15px] mt-6 leading-relaxed">{thread.summary_en}</p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-6 pb-6 border-b border-border text-[12px] text-muted-foreground">
              <span>
                Started by <span className="dv-text mx-1">{thread.started_by_dv}</span>
                <span className="font-mono">({thread.started_by_en})</span>
              </span>
              <span>·</span>
              <span>
                <span className="font-mono font-semibold text-foreground">{thread.reply_count}</span> replies
              </span>
              <span>
                <span className="font-mono font-semibold text-foreground">{thread.claim_count}</span> claims
              </span>
              <span>
                <span className="font-mono font-semibold text-foreground">{thread.vote_count}</span> votes
              </span>
            </div>

            {isHero ? (
              <section className="mt-10">
                <div className="flex items-baseline justify-between mb-6 gap-4 flex-wrap">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[10.5px] text-muted-foreground tracking-[0.12em]">
                      01
                    </span>
                    <h2 className="font-mono text-[12px] uppercase tracking-[0.14em] font-semibold">
                      Claims · pros & cons
                    </h2>
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {pros.length} pro · {cons.length} con · {thread.claim_count - claims.length} more notional
                  </span>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <div className="flex items-baseline justify-between mb-3">
                      <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] font-semibold text-[color:var(--under)]">
                        Pros · {pros.length}
                      </h3>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        Σ {pros.reduce((s, c) => s + c.vote_count, 0)} votes
                      </span>
                    </div>
                    <div className="grid gap-3">
                      {pros.map((c, i) => (
                        <ClaimCard key={c.id} claim={c} index={i + 1} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between mb-3">
                      <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] font-semibold text-[color:var(--over)]">
                        Cons · {cons.length}
                      </h3>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        Σ {cons.reduce((s, c) => s + c.vote_count, 0)} votes
                      </span>
                    </div>
                    <div className="grid gap-3">
                      {cons.map((c, i) => (
                        <ClaimCard key={c.id} claim={c} index={i + 1} />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="mt-10 pt-6 border-t border-border text-[11px] text-muted-foreground leading-relaxed max-w-2xl">
                  Inline voting and add-claim affordances are visual-only in v0;
                  they wire up with the eFaas stub in the next milestone. Vote
                  counts and impact ratings shown are seed values.
                </p>
              </section>
            ) : (
              <section className="mt-10 bg-muted/40 border border-border p-6">
                <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground mb-3">
                  v0 stub
                </div>
                <h2 className="text-lg font-semibold mb-2">
                  Full thread page coming in v1
                </h2>
                <p className="text-[13.5px] text-muted-foreground leading-relaxed max-w-prose">
                  The Maafaru airport thread is the v0 hero — fully wired with
                  claims, civic-data sidebar, and the Pros/Cons primitive. Other
                  threads route here. The metadata, summary, and stats above are
                  real fixture data that will populate the full thread page in
                  the next milestone.
                </p>
                <div className="mt-5">
                  <Link
                    href={`/sandbar/${HERO_THREAD_ID}`}
                    className="inline-flex items-center text-[13px] text-primary hover:underline font-mono"
                  >
                    See the hero thread (Maafaru airport) →
                  </Link>
                </div>
              </section>
            )}
          </article>

          {/* Sidebar */}
          {island && (
            <CivicDataSidebar island={island} excludeThreadId={thread.id} />
          )}
        </div>
      </div>
    </main>
  );
}
