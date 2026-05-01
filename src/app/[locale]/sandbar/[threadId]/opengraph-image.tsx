import { ImageResponse } from "next/og";
import { getThread } from "@/db/queries/threads";
import { getIslandById } from "@/db/queries/islands";
import {
  OG_PALETTE,
  OG_SIZE,
  OG_CONTENT_TYPE,
  loadInterFamily,
} from "@/lib/og-fonts";

// Per-thread OG variant. Headline = thread title (Latin); eyebrow carries
// issue tag + island; bottom ledger row carries the activity stats.

export const alt = "Baaruveri — Sandbar thread";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const { paper: PAPER, ink: INK, teal: TEAL, rule: RULE, muted: MUTED } =
  OG_PALETTE;

interface Params {
  params: Promise<{ locale: string; threadId: string }>;
}

export default async function Image({ params }: Params) {
  const { threadId } = await params;
  const thread = await getThread(threadId);
  const fonts = await loadInterFamily();

  const island = thread?.island_id
    ? await getIslandById(thread.island_id)
    : undefined;

  const title = thread?.title_en ?? "Baaruveri";
  const summary = thread?.summary_en ?? "Per-island civic data, made browsable.";
  const issueLabel = thread?.issue?.toUpperCase() ?? "SANDBAR";
  const islandLabel = island ? island.name_en.toUpperCase() : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: PAPER,
          display: "flex",
          flexDirection: "column",
          fontFamily: "Inter",
          color: INK,
          padding: "60px 80px",
        }}
      >
        {/* Eyebrow: brand + sandbar + issue + island */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            paddingBottom: 18,
            borderBottom: `1px solid ${RULE}`,
            fontSize: 16,
            fontWeight: 500,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: TEAL,
          }}
        >
          <span>Baaruveri</span>
          <span style={{ color: RULE }}>/</span>
          <span style={{ color: MUTED, letterSpacing: 2 }}>Sandbar</span>
          <span style={{ color: RULE }}>/</span>
          <span style={{ color: MUTED, letterSpacing: 2 }}>{issueLabel}</span>
          {islandLabel && (
            <>
              <span style={{ color: RULE }}>·</span>
              <span style={{ color: MUTED, letterSpacing: 2 }}>{islandLabel}</span>
            </>
          )}
        </div>

        {/* Title + summary excerpt */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            paddingTop: 36,
            paddingBottom: 36,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: -1.5,
              maxWidth: 1040,
            }}
          >
            <span>{truncate(title, 110)}</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 24,
              fontWeight: 400,
              color: MUTED,
              lineHeight: 1.4,
              maxWidth: 980,
            }}
          >
            <span>{truncate(summary, 220)}</span>
          </div>
        </div>

        {/* Bottom ledger row: URL + activity stats */}
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            borderTop: `1px solid ${RULE}`,
            paddingTop: 26,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "14px 22px",
              background: TEAL,
              color: PAPER,
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: 1,
              flexShrink: 0,
            }}
          >
            baaruveri.thecrayfish.tech/sandbar
          </div>
          {thread && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 28,
                paddingLeft: 36,
                fontSize: 18,
                color: MUTED,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <Stat value={thread.claim_count} label="claims" />
              <span style={{ color: RULE }}>·</span>
              <Stat value={thread.vote_count} label="votes" />
            </div>
          )}
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <span style={{ color: INK, fontWeight: 600 }}>{value}</span>
      <span>{label}</span>
    </div>
  );
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}
