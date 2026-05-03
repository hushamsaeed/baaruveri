import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ISSUE_TAGS, type IssueTag } from "@/lib/types";
import { L } from "@/components/i18n-text";

// Vignelli civic-press side index — spec §7.7. Rendered in the
// 240px left rail of the desktop home grid. Numbered list of the
// platform's issue taxonomy with leading-zero ordinals, each row
// a link to the Sandbar filtered by issue. Active row inverts to
// ink background with paper type and full-bleeds the rail.
//
// The reference HTML shows 16 illustrative categories; the v0
// schema has 7 IssueTags. The rail uses the real taxonomy — adding
// unsupported categories would conflict with the content-fidelity
// rule (real or honest placeholder; nothing fake). When the
// IssueTag enum grows, the rail grows with it.

interface SideIndexProps {
  activeIssue?: IssueTag | null;
}

export async function SideIndex({ activeIssue = null }: SideIndexProps) {
  const t = await getTranslations("side_index");
  const ti = await getTranslations("issue");

  return (
    <div>
      <h3
        className="uppercase"
        style={{
          fontFamily: "var(--font-display, 'Archivo Black'), sans-serif",
          fontSize: "14px",
          letterSpacing: "0.06em",
          marginBottom: "14px",
          paddingBottom: "8px",
          borderBottom: "2px solid var(--ink)",
        }}
      >
        <L>{t("heading")}</L>
      </h3>
      <ol
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
        }}
      >
        {ISSUE_TAGS.map((issue, i) => {
          const isActive = activeIssue === issue;
          const ord = String(i + 1).padStart(2, "0");
          return (
            <li
              key={issue}
              style={{
                borderBottom: "1px solid var(--paper-rule)",
                background: isActive ? "var(--ink)" : "transparent",
                color: isActive ? "var(--paper)" : "var(--ink)",
                margin: isActive ? "0 -20px" : "0",
              }}
            >
              <Link
                href={`/sandbar?issue=${issue}`}
                className="flex items-baseline gap-3 hover:text-[var(--vignelli-red)]"
                style={{
                  padding: isActive ? "6px 20px" : "6px 0",
                  fontSize: "13px",
                  fontFamily: "var(--font-sans), 'Inter', sans-serif",
                  fontWeight: 500,
                  color: "inherit",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                    fontSize: "10px",
                    fontWeight: 700,
                    color: isActive ? "var(--paper)" : "var(--ink-soft)",
                    minWidth: "1.6em",
                    flexShrink: 0,
                  }}
                >
                  {ord}
                </span>
                <span style={{ flex: 1 }}>
                  <L>{ti(issue)}</L>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
