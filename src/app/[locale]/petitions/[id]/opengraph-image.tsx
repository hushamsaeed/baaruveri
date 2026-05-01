import { ImageResponse } from "next/og";
import { getPetition } from "@/db/queries/petitions";
import { getSignatureCount } from "@/db/queries/signatures";
import {
  OG_PALETTE,
  OG_SIZE,
  OG_CONTENT_TYPE,
  loadInterFamily,
} from "@/lib/og-fonts";

// Per-petition OG variant. The signature progress is the headline number
// — that's the one piece of data that makes the petition worth sharing.

export const alt = "Baaruveri — petition";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const { paper: PAPER, ink: INK, teal: TEAL, rule: RULE, muted: MUTED } =
  OG_PALETTE;

interface Params {
  params: Promise<{ locale: string; id: string }>;
}

export default async function Image({ params }: Params) {
  const { id } = await params;
  const [petition, sessionSignatures, fonts] = await Promise.all([
    getPetition(id),
    getSignatureCount(id).catch(() => 0),
    loadInterFamily(),
  ]);

  const title = petition?.title_en ?? "Baaruveri";
  const totalSignatures = petition
    ? petition.signatures + sessionSignatures
    : 0;
  const threshold = petition?.threshold ?? 0;
  const pct = threshold > 0 ? Math.min(100, (totalSignatures / threshold) * 100) : 0;
  const remaining = Math.max(0, threshold - totalSignatures);
  const scopeLabel =
    petition?.scope === "national" ? "NATIONAL" : "ISLAND";

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
          <span style={{ color: MUTED, letterSpacing: 2 }}>Petition</span>
          <span style={{ color: RULE }}>/</span>
          <span style={{ color: MUTED, letterSpacing: 2 }}>{scopeLabel}</span>
        </div>

        {/* Center: title + the live counter */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            paddingTop: 36,
            paddingBottom: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: -1,
              maxWidth: 1040,
            }}
          >
            <span>{truncate(title, 130)}</span>
          </div>

          {petition && (
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 24,
                marginTop: 36,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <span
                style={{
                  fontSize: 88,
                  fontWeight: 700,
                  color: TEAL,
                  letterSpacing: -2,
                  lineHeight: 1,
                }}
              >
                {totalSignatures.toLocaleString("en-US")}
              </span>
              <span
                style={{
                  fontSize: 24,
                  color: MUTED,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span>of {threshold.toLocaleString("en-US")} signatures</span>
                <span style={{ fontSize: 18, marginTop: 4 }}>
                  {remaining > 0
                    ? `${remaining.toLocaleString("en-US")} more to trigger response`
                    : "threshold reached"}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Progress bar above the bottom ledger */}
        {petition && (
          <div
            style={{
              display: "flex",
              height: 6,
              background: RULE,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                background: TEAL,
                display: "flex",
              }}
            />
          </div>
        )}

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
            baaruveri.thecrayfish.tech/petitions
          </div>
          {petition && (
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
                <span style={{ color: INK, fontWeight: 600 }}>
                  {pct.toFixed(0)}%
                </span>
                <span>of threshold</span>
              </div>
              <span style={{ color: RULE }}>·</span>
              <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                <span style={{ color: INK, fontWeight: 600 }}>
                  {petition.efaas_verified_pct}%
                </span>
                <span>eFaas-verified</span>
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}
