import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { L } from "./i18n-text";
import { relativeDate } from "@/lib/date";
import type { Thread } from "@/lib/types";

interface ThreadListItemProps {
  thread: Thread;
}

export function ThreadListItem({ thread }: ThreadListItemProps) {
  const ti = useTranslations("issue");
  const tt = useTranslations("thread");
  return (
    <Link
      href={`/sandbar/${thread.id}`}
      className="block bg-card border border-border p-5 hover:border-primary/40 transition-colors"
    >
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2 font-mono">
        <span className="bg-secondary text-secondary-foreground px-2 py-[1px] uppercase tracking-[0.1em] font-semibold text-[10px]">
          <L>{ti(thread.issue)}</L>
        </span>
        <span>·</span>
        <span>{relativeDate(thread.started_at, tt)}</span>
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
          <span className="font-mono font-semibold text-foreground">{thread.claim_count}</span>{" "}
          <L>{tt("claims")}</L>
        </span>
        <span>
          <span className="font-mono font-semibold text-foreground">{thread.vote_count}</span>{" "}
          <L>{tt("votes")}</L>
        </span>
        <span className="ms-auto">
          <L>{tt("started_by")}</L>{" "}
          <span className="dv-text mx-1">{thread.started_by_dv}</span>
        </span>
      </div>
    </Link>
  );
}
