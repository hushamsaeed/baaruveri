import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { getThread } from "@/db/queries/threads";
import { getClaimsForThread, HERO_THREAD_ID } from "@/db/queries/claims";
import { getIslandById } from "@/db/queries/islands";
import { getCommentsForThread, type Comment } from "@/db/queries/comments";
import { getCurrentStubUser, type StubUser } from "@/lib/auth-stub";
import { getAnonId } from "@/lib/anon-cookie";
import { pseudonymFor } from "@/lib/pseudonym";
import { commentRequiresVerification } from "@/lib/comment-policy";
import { ClaimCard } from "@/components/claim-card";
import { CivicDataSidebar } from "@/components/civic-data-sidebar";
import { CommentList } from "@/components/comment-list";
import { CommentForm } from "@/components/comment-form";
import { L } from "@/components/i18n-text";
import { relativeDate } from "@/lib/date";
import type { Thread, Claim, Island } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; threadId: string }>;
}) {
  const { threadId } = await params;
  const thread = await getThread(threadId);
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
  const { locale, threadId } = await params;
  setRequestLocale(locale);
  const thread = await getThread(threadId);
  if (!thread) notFound();

  const [island, claims, comments, user, anonId] = await Promise.all([
    thread.island_id ? getIslandById(thread.island_id) : Promise.resolve(undefined),
    getClaimsForThread(thread.id),
    getCommentsForThread(thread.id),
    getCurrentStubUser(),
    getAnonId(),
  ]);
  const isHero = thread.id === HERO_THREAD_ID;
  const verificationRequired = commentRequiresVerification(thread.issue);
  // Pseudonym preview only meaningful when (a) user isn't verified AND (b)
  // they CAN post on this thread. Don't compute it before the anon cookie
  // exists either — first comment will mint one.
  const anonPseudonymPreview =
    !user && !verificationRequired && anonId
      ? pseudonymFor(anonId, thread.id)
      : null;

  return (
    <ThreadBody
      thread={thread}
      island={island}
      claims={claims}
      comments={comments}
      isHero={isHero}
      user={user}
      anonPseudonymPreview={anonPseudonymPreview}
      verificationRequired={verificationRequired}
    />
  );
}

function ThreadBody({
  thread,
  island,
  claims,
  comments,
  isHero,
  user,
  anonPseudonymPreview,
  verificationRequired,
}: {
  thread: Thread;
  island: Island | undefined;
  claims: Claim[];
  comments: Comment[];
  isHero: boolean;
  user: StubUser | null;
  anonPseudonymPreview: string | null;
  verificationRequired: boolean;
}) {
  const ti = useTranslations("issue");
  const tt = useTranslations("thread");
  const tn = useTranslations("nav");
  const ttd = useTranslations("thread_detail");
  const tcomment = useTranslations("comment");
  const pros = claims.filter((c) => c.side === "pro");
  const cons = claims.filter((c) => c.side === "con");
  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 pt-8 pb-20">
        <Link
          href="/sandbar"
          className="inline-flex items-center text-[12px] text-muted-foreground hover:text-foreground transition-colors mb-8 font-mono"
        >
          <L>{tn("back_to_sandbar")}</L>
        </Link>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
          {/* Main thread column */}
          <article>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-4 font-mono uppercase tracking-[0.1em]">
              <span className="bg-secondary text-secondary-foreground px-2 py-[2px]">
                <L>{ti(thread.issue)}</L>
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
              <span>{relativeDate(thread.started_at, tt)}</span>
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
                <L>{tt("started_by")}</L>{" "}
                <span className="dv-text mx-1">{thread.started_by_dv}</span>
                <span className="font-mono">({thread.started_by_en})</span>
              </span>
              <span>·</span>
              <span>
                <span className="font-mono font-semibold text-foreground">{thread.reply_count}</span>{" "}
                <L>{tt("replies")}</L>
              </span>
              <span>
                <span className="font-mono font-semibold text-foreground">{thread.claim_count}</span>{" "}
                <L>{tt("claims")}</L>
              </span>
              <span>
                <span className="font-mono font-semibold text-foreground">{thread.vote_count}</span>{" "}
                <L>{tt("votes")}</L>
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
                      <L>{tt("section_claims")}</L>
                    </h2>
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    <L>
                      {tt("section_claims_meta", {
                        pros: pros.length,
                        cons: cons.length,
                        more: thread.claim_count - claims.length,
                      })}
                    </L>
                  </span>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <div className="flex items-baseline justify-between mb-3">
                      <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] font-semibold text-[color:var(--under)]">
                        <L>{tt("pros_label", { count: pros.length })}</L>
                      </h3>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        <L>{tt("votes_sum", { sum: pros.reduce((s, c) => s + c.vote_count, 0) })}</L>
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
                        <L>{tt("cons_label", { count: cons.length })}</L>
                      </h3>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        <L>{tt("votes_sum", { sum: cons.reduce((s, c) => s + c.vote_count, 0) })}</L>
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
                  <L>{ttd("v0_voting_note")}</L>
                </p>
              </section>
            ) : (
              <section className="mt-10 bg-muted/40 border border-border p-6">
                <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground mb-3">
                  v0 stub
                </div>
                <h2 className="text-lg font-semibold mb-2">
                  <L>{tt("v0_stub_title")}</L>
                </h2>
                <p className="text-[13.5px] text-muted-foreground leading-relaxed max-w-prose">
                  <L>{tt("v0_stub_body")}</L>
                </p>
                <div className="mt-5">
                  <Link
                    href={`/sandbar/${HERO_THREAD_ID}`}
                    className="inline-flex items-center text-[13px] text-primary hover:underline font-mono"
                  >
                    <L>{tt("v0_stub_cta")}</L>
                  </Link>
                </div>
              </section>
            )}

            {/* Comments — always shown, regardless of hero/stub state */}
            <section className="mt-12">
              <div className="flex items-baseline justify-between mb-6 gap-4 flex-wrap">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[10.5px] text-muted-foreground tracking-[0.12em]">
                    {isHero ? "02" : "01"}
                  </span>
                  <h2 className="font-mono text-[12px] uppercase tracking-[0.14em] font-semibold">
                    <L>{tcomment("section_title")}</L>
                  </h2>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">
                  <L>{tcomment("section_meta", { count: comments.length })}</L>
                </span>
              </div>
              <div className="space-y-5">
                <CommentForm
                  threadId={thread.id}
                  threadIssue={thread.issue}
                  user={user}
                  anonPseudonymPreview={anonPseudonymPreview}
                  verificationRequired={verificationRequired}
                  returnTo={`/sandbar/${thread.id}`}
                />
                <CommentList comments={comments} />
              </div>
            </section>
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
