import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { L } from "./i18n-text";
import { issueToLane, LANE_COLOR_VAR } from "@/lib/lane-policy";
import type { Thread } from "@/lib/types";

// Vignelli civic-press topic card — spec §7.3.
// Anchor strip (island block + lane block + category) → topic ID
// (mono, top-end) → hero title (Archivo Black ALL CAPS) → DV title
// (MV Faseyha 700) → lede (Inter 500) → 4-column ledger.
//
// The Adu strip + reactions strip from the spec are deferred to a
// later batch — they need post-level data that isn't seeded yet.
//
// Lane stripe is a solid 8px border on the inset-start (left in EN,
// right in DV).

interface ThreadListItemProps {
  thread: Thread;
  /** Optional v0-issue/MAA-001 style topic id badge. If not given,
   *  derives from thread.id with a deterministic transform. */
  topicId?: string;
}

function deriveTopicId(thread: Thread): string {
  // Format: T·NN·ISL·NNN where NN is the lane ordinal and ISL is a
  // 3-letter island code. Falls back to a slugified thread id.
  const lane = issueToLane(thread.issue);
  const laneOrdinal: Record<typeof lane, string> = {
    judiciary: "01",
    parliamentary: "02",
    presidency: "03",
    council: "04",
  };
  const islandStem = thread.island_id?.split("-").pop()?.slice(0, 3).toUpperCase();
  const tail = thread.id.split("-").slice(-1)[0]?.padStart(3, "0").toUpperCase();
  return ["T", laneOrdinal[lane], islandStem ?? "MV", tail ?? "000"].join("·");
}

export function ThreadListItem({ thread, topicId }: ThreadListItemProps) {
  const ti = useTranslations("issue");
  const tt = useTranslations("thread");
  const tLane = useTranslations("lane");
  const lane = issueToLane(thread.issue);
  const id = topicId ?? deriveTopicId(thread);
  const laneColor = LANE_COLOR_VAR[lane];
  const islandTag = thread.island_id?.split("-").pop()?.toUpperCase() ?? "MV";

  return (
    <Link
      href={`/sandbar/${thread.id}`}
      className="block relative bg-paper hover:bg-[color:var(--paper-deep)] transition-colors"
      style={{
        borderInlineStart: `8px solid ${laneColor}`,
        borderBottom: "1px solid var(--ink)",
      }}
    >
      <article className="px-7 sm:px-9 py-7 sm:py-8">
        {/* Topic ID — top-end, monospace */}
        <div
          className="absolute top-6 end-6 sm:top-7 sm:end-9 font-mono text-[10.5px] uppercase tracking-[0.16em] font-bold pointer-events-none"
          style={{ color: "var(--ink-soft)" }}
          aria-hidden
        >
          {id}
        </div>

        {/* Anchor strip — island · lane · category */}
        <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 mb-4">
          <span
            className="px-2.5 py-[3px] text-[10.5px] font-bold uppercase tracking-[0.12em]"
            style={{
              fontFamily: "var(--font-sans-bold)",
              background: "var(--ink)",
              color: "var(--paper)",
            }}
          >
            {islandTag}
          </span>
          <span
            className="px-2.5 py-[3px] text-[10.5px] font-bold uppercase tracking-[0.12em]"
            style={{
              fontFamily: "var(--font-sans-bold)",
              background: laneColor,
              color: "var(--paper)",
            }}
          >
            {tLane(`${lane}_label`)}
          </span>
          <span
            className="text-[10.5px] font-bold uppercase tracking-[0.12em] pb-[2px]"
            style={{
              fontFamily: "var(--font-sans-bold)",
              color: "var(--ink-soft)",
              borderBottom: "2px solid var(--ink-soft)",
            }}
          >
            <L>{ti(thread.issue)}</L>
          </span>
        </div>

        {/* Hero title — Archivo Black ALL CAPS */}
        <h2
          className="font-display text-[28px] sm:text-[36px] lg:text-[40px] mb-2 max-w-[22ch]"
          style={{
            fontFamily: "var(--font-display), sans-serif",
            lineHeight: 0.95,
            letterSpacing: "-0.025em",
            textTransform: "uppercase",
          }}
        >
          {thread.title_en}
        </h2>

        {/* DV title — MV Faseyha 700, sized smaller per spec parity rule */}
        <p
          className="dv-text font-bold text-[22px] sm:text-[28px] mb-4 max-w-[22ch]"
          style={{
            lineHeight: 1.4,
          }}
        >
          {thread.title_dv}
        </p>

        {/* Lede */}
        {thread.summary_en && (
          <p
            className="text-[15px] sm:text-[16px] leading-[1.45] max-w-[56ch] mb-5"
            style={{ color: "var(--ink)", fontWeight: 500 }}
          >
            {thread.summary_en}
          </p>
        )}

        {/* Ledger — 4-col tabular */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 mt-5"
          style={{
            borderTop: "2px solid var(--ink)",
            borderBottom: "1px solid var(--ink)",
          }}
        >
          <LedgerCell
            label={tt("claims")}
            value={thread.claim_count.toLocaleString("en-US")}
          />
          <LedgerCell
            label={tt("votes")}
            value={thread.vote_count.toLocaleString("en-US")}
          />
          <LedgerCell
            label={tt("started_by_label")}
            value={thread.started_by_en}
            valueIsMono
          />
          <LedgerCell
            label={tt("started_label")}
            value={thread.started_at}
            valueIsMono
          />
        </div>
      </article>
    </Link>
  );
}

function LedgerCell({
  label,
  value,
  valueIsMono,
}: {
  label: string;
  value: string;
  valueIsMono?: boolean;
}) {
  return (
    <div
      className="px-4 py-3"
      style={{ borderInlineEnd: "1px solid var(--paper-rule)" }}
    >
      <div
        className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-[0.12em] mb-1"
        style={{
          fontFamily: "var(--font-sans-bold)",
          color: "var(--ink-soft)",
        }}
      >
        <L>{label}</L>
      </div>
      {valueIsMono ? (
        <div
          className="font-mono text-[11px] sm:text-[12px]"
          style={{ color: "var(--ink)" }}
        >
          {value}
        </div>
      ) : (
        <div
          className="font-display text-[22px] sm:text-[26px]"
          style={{
            fontFamily: "var(--font-display), sans-serif",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </div>
      )}
    </div>
  );
}
