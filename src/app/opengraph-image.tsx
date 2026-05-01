import { ImageResponse } from "next/og";
import {
  OG_PALETTE,
  OG_SIZE,
  OG_CONTENT_TYPE,
  loadInterFamily,
} from "@/lib/og-fonts";

// Site-wide default Open Graph image. Saafu civic-ledger DNA: paper
// background, gazette teal accent, hairline rules, tabular numerals.
// Per-segment variants live at /atlas/[slug]/opengraph-image.tsx and
// /sandbar/[threadId]/opengraph-image.tsx and inherit the same DNA.
//
// Dhivehi script intentionally absent — see lib/og-fonts.ts header
// comment + feedback_satori_thaana.md memory.

export const alt = "Baaruveri — Maldives citizen civic platform";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const { paper: PAPER, ink: INK, teal: TEAL, rule: RULE, muted: MUTED } =
  OG_PALETTE;

export default async function Image() {
  const fonts = await loadInterFamily();

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
        {/* Top hairline eyebrow */}
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
          <span style={{ color: MUTED, letterSpacing: 2 }}>
            Concept prototype
          </span>
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
              flexDirection: "column",
              fontSize: 92,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 980,
            }}
          >
            <span>Per-island civic data,</span>
            <span>made browsable.</span>
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 28,
              fontWeight: 400,
              color: MUTED,
              lineHeight: 1.35,
              maxWidth: 880,
            }}
          >
            Threaded debate by issue and island. eFaas-verified petitions
            with threshold-triggered government response.
          </div>
        </div>

        {/* Bottom ledger row: teal accent + tabular numerals */}
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            gap: 0,
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
            baaruveri.thecrayfish.tech
          </div>
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
            <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
              <span style={{ color: INK, fontWeight: 600 }}>6</span>
              <span>islands</span>
            </div>
            <span style={{ color: RULE }}>·</span>
            <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
              <span style={{ color: INK, fontWeight: 600 }}>11</span>
              <span>threads</span>
            </div>
            <span style={{ color: RULE }}>·</span>
            <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
              <span style={{ color: INK, fontWeight: 600 }}>7</span>
              <span>petitions</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}

