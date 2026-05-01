import { ImageResponse } from "next/og";
import { getIsland } from "@/db/queries/islands";
import {
  OG_PALETTE,
  OG_SIZE,
  OG_CONTENT_TYPE,
  loadInterFamily,
} from "@/lib/og-fonts";

// Per-island OG variant. Same Saafu DNA as the root /opengraph-image but
// the headline becomes the island name (Latin) and the bottom ledger row
// carries the three signature stats: population, council seats, FY26
// budget. Atoll + slug shown in the eyebrow.

export const alt = "Baaruveri — island civic profile";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const { paper: PAPER, ink: INK, teal: TEAL, rule: RULE, muted: MUTED } =
  OG_PALETTE;

interface Params {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function Image({ params }: Params) {
  const { slug } = await params;
  const island = await getIsland(slug);
  const fonts = await loadInterFamily();

  // Defensive fallback if a crawler hits an unknown slug — render the
  // root brand card rather than 404. Same overall composition.
  const title = island?.name_en ?? "Baaruveri";
  const subtitle = island
    ? `${island.atoll_en} Atoll · ${island.atoll_code} · per-island civic profile`
    : "Per-island civic data, made browsable.";
  const stats: { value: string; label: string }[] = island
    ? [
        { value: formatThousands(island.population), label: "population" },
        {
          value: String(island.council_seats),
          label: island.council_seats === 1 ? "seat" : "seats",
        },
        {
          value: `MVR ${formatShortMvr(island.fy26_budget_mvr)}`,
          label: "FY26",
        },
      ]
    : [];

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
        {/* Eyebrow */}
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
          <span style={{ color: MUTED, letterSpacing: 2 }}>Atlas</span>
          {island && (
            <>
              <span style={{ color: RULE }}>/</span>
              <span style={{ color: MUTED, letterSpacing: 2 }}>
                {slug.toUpperCase()}
              </span>
            </>
          )}
        </div>

        {/* Center title block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            paddingTop: 40,
            paddingBottom: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 1040,
            }}
          >
            <span>{title}</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 22,
              fontSize: 26,
              fontWeight: 400,
              color: MUTED,
              lineHeight: 1.35,
              maxWidth: 940,
            }}
          >
            <span>{subtitle}</span>
          </div>
        </div>

        {/* Bottom ledger row */}
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
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: 1,
            }}
          >
            baaruveri.thecrayfish.tech/atlas/{slug}
          </div>
          {stats.length > 0 && (
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
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  style={{ display: "flex", alignItems: "baseline", gap: 8 }}
                >
                  {i > 0 && (
                    <span style={{ color: RULE, marginRight: 20 }}>·</span>
                  )}
                  <span style={{ color: INK, fontWeight: 600 }}>{s.value}</span>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}

function formatThousands(n: number): string {
  return n.toLocaleString("en-US");
}

function formatShortMvr(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}
