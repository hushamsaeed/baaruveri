import { getTranslations } from "next-intl/server";
import { listStubUsers } from "@/db/queries/stub-users";
import { L } from "@/components/i18n-text";

// Vignelli civic-press posting rail — spec §7.8. Right rail of the
// home grid. Numbered list (01-04) of recognisable posters with
// ordinal in vignelli-red Archivo Black, name in Archivo 700 caps,
// role + reason in Inter (reason italic, max 22ch).
//
// v0 caveat: post-level activity (response counts, citation counts,
// posting velocity) isn't seeded — schema doesn't track per-user
// post tallies yet. The rail surfaces the four eFaas stub personas
// instead, with their real island + verification metadata, and a
// footnote explaining the activity-ranking limitation. When the
// post primitive grows author tallies, the query swaps in.

export async function PostingRail() {
  const t = await getTranslations("posting_rail");
  const users = await listStubUsers();
  const top4 = users.slice(0, 4);

  return (
    <aside
      className="hidden lg:block"
      aria-label={t("heading")}
      style={{
        borderInlineStart: "1px solid var(--ink)",
        padding: "24px 20px",
      }}
    >
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
      <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {top4.map((u, i) => (
          <li
            key={u.id}
            style={{
              padding: "10px 0",
              borderBottom: "1px solid var(--paper-rule)",
              display: "grid",
              gridTemplateColumns: "36px 1fr",
              gap: "12px",
              alignItems: "start",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display, 'Archivo Black'), sans-serif",
                fontSize: "22px",
                lineHeight: 1,
                color: "var(--vignelli-red)",
                letterSpacing: "-0.02em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </div>
            <div>
              <div
                className="uppercase"
                style={{
                  fontFamily: "var(--font-sans-bold), 'Archivo', sans-serif",
                  fontWeight: 700,
                  fontSize: "13px",
                  letterSpacing: "0.04em",
                  lineHeight: 1.2,
                }}
              >
                {u.name_en}
              </div>
              <div
                className="dv-text"
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  lineHeight: 1.2,
                  marginTop: "2px",
                }}
              >
                {u.name_dv}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans), 'Inter', sans-serif",
                  fontSize: "11px",
                  color: "var(--ink-soft)",
                  marginTop: "4px",
                }}
              >
                <L>{t("role", { island: u.island_slug })}</L>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans), 'Inter', sans-serif",
                  fontSize: "11px",
                  color: "var(--ink)",
                  marginTop: "4px",
                  fontStyle: "italic",
                  lineHeight: 1.4,
                  maxWidth: "22ch",
                }}
              >
                <L>{t("reason", { date: u.verified_at })}</L>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <p
        style={{
          fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
          fontSize: "9.5px",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--ink-soft)",
          marginTop: "16px",
          lineHeight: 1.6,
        }}
      >
        <L>{t("footnote")}</L>
      </p>
    </aside>
  );
}
