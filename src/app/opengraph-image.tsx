import { ImageResponse } from "next/og";

// Site-wide default Open Graph image. Saafu civic-ledger DNA: paper
// background, gazette teal accent, hairline rules, tabular numerals.
// Per-segment overrides (atlas/[slug], sandbar/[threadId], petitions/[id])
// land in v2 of this surface.

export const alt = "Baaruveri — Maldives citizen civic platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#fafaf8";
const INK = "#1a1a1a";
const TEAL = "#0d6e6e";
const RULE = "#dcdcdc";
const MUTED = "#6b6b6b";

async function loadInter(weight: 400 | 500 | 700): Promise<ArrayBuffer> {
  // Latin subset of Inter from Google Fonts. Fetched once at build time
  // (this image is statically optimized — no per-request network call).
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&display=swap`,
    { headers: { "User-Agent": "Mozilla/5.0" } }
  ).then((r) => r.text());
  const url = css.match(/url\((https:\/\/[^)]+)\)/)?.[1];
  if (!url) throw new Error("Inter font URL not found in Google Fonts CSS");
  const res = await fetch(url);
  return res.arrayBuffer();
}

// NOTE: Dhivehi script (ބާރުވެރި) is intentionally absent from this v0 of
// the OG image. Satori (the renderer behind next/og) doesn't shape Thaana
// correctly even with MV Faseyha loaded from RaajjeFonts — the Thaana
// characters render as .notdef tofu glyphs because satori's text shaper
// doesn't handle the script's complex bidirectional + combining-mark
// composition. The locked Saafu bilingual parity rule applies to the live
// web pages (where it works); the OG image is a satori-rendered thumbnail
// with this technical ceiling. Revisit when satori adds Thaana shaping.

export default async function Image() {
  const [interRegular, interMedium, interBold] = await Promise.all([
    loadInter(400),
    loadInter(500),
    loadInter(700),
  ]);

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
    {
      ...size,
      fonts: [
        { name: "Inter", data: interRegular, weight: 400, style: "normal" },
        { name: "Inter", data: interMedium, weight: 500, style: "normal" },
        { name: "Inter", data: interBold, weight: 700, style: "normal" },
      ],
    }
  );
}

