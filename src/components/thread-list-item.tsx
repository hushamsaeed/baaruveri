import Link from "next/link";
import type { Thread } from "@/lib/types";

interface ThreadListItemProps {
  thread: Thread;
}

const ISSUE_LABELS: Record<Thread["issue"], string> = {
  housing: "Housing",
  judiciary: "Judiciary",
  climate: "Climate",
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

export function ThreadListItem({ thread }: ThreadListItemProps) {
  return (
    <Link
      href={`/sandbar/${thread.id}`}
      className="block bg-card border border-border p-5 hover:border-primary/40 transition-colors"
    >
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2 font-mono">
        <span className="bg-secondary text-secondary-foreground px-2 py-[1px] uppercase tracking-[0.1em] font-semibold text-[10px]">
          {ISSUE_LABELS[thread.issue]}
        </span>
        <span>·</span>
        <span>{relativeDate(thread.started_at)}</span>
      </div>
      <h3 className="text-base font-semibold leading-snug">
        <span className="dv-text">{thread.title_dv}</span>
      </h3>
      <p className="text-[13px] text-muted-foreground mt-2 leading-relaxed">
        {thread.title_en}
      </p>
      {thread.summary_en && (
        <p className="text-[13px] mt-2 leading-relaxed">{thread.summary_en}</p>
      )}
      <div className="flex items-center gap-5 mt-4 pt-3 border-t border-border text-[11px] text-muted-foreground">
        <span>
          <span className="font-mono font-semibold text-foreground">{thread.reply_count}</span> replies
        </span>
        <span>
          <span className="font-mono font-semibold text-foreground">{thread.claim_count}</span> claims
        </span>
        <span>
          <span className="font-mono font-semibold text-foreground">{thread.vote_count}</span> votes
        </span>
        <span className="ml-auto">
          Started by <span className="dv-text mx-1">{thread.started_by_dv}</span>
        </span>
      </div>
    </Link>
  );
}
