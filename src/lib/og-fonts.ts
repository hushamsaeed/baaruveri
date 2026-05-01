// Shared font loaders + Saafu palette constants for /opengraph-image.tsx
// routes (root + per-segment). All these surfaces are statically optimised
// so the network calls happen at build time, not per request.
//
// Dhivehi (Thaana) intentionally absent everywhere — see
// feedback_satori_thaana.md memory: satori doesn't shape Thaana glyphs
// even with Faseyha loaded.

export const OG_PALETTE = {
  paper: "#fafaf8",
  ink: "#1a1a1a",
  teal: "#0d6e6e",
  rule: "#dcdcdc",
  muted: "#6b6b6b",
  under: "#1d4e89", // Saafu pro/under blue
  over: "#a3401a",  // Saafu con/over rust
} as const;

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

type InterWeight = 400 | 500 | 700;

export async function loadInter(weight: InterWeight): Promise<ArrayBuffer> {
  // Latin subset of Inter from Google Fonts.
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&display=swap`,
    { headers: { "User-Agent": "Mozilla/5.0" } }
  ).then((r) => r.text());
  const url = css.match(/url\((https:\/\/[^)]+)\)/)?.[1];
  if (!url) throw new Error("Inter font URL not found in Google Fonts CSS");
  const res = await fetch(url);
  return res.arrayBuffer();
}

export interface InterFontFace {
  name: "Inter";
  data: ArrayBuffer;
  weight: InterWeight;
  style: "normal";
}

// Convenience: returns the standard 3-weight Inter family used across all
// Baaruveri OG variants. Plays nicely with ImageResponse's `fonts` option.
export async function loadInterFamily(): Promise<InterFontFace[]> {
  const [w400, w500, w700] = await Promise.all([
    loadInter(400),
    loadInter(500),
    loadInter(700),
  ]);
  return [
    { name: "Inter", data: w400, weight: 400, style: "normal" },
    { name: "Inter", data: w500, weight: 500, style: "normal" },
    { name: "Inter", data: w700, weight: 700, style: "normal" },
  ];
}
