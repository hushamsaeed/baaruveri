import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { L } from "@/components/i18n-text";

// Vignelli civic-press compose CTA — spec §7.9. Single button,
// vignelli-red background with paper type, Archivo Black 18px caps
// + JetBrains Mono arrow. Full-width of the side rail. Reads "POST"
// in EN, "ބަސް ނެރޭ" in DV. Routes to the Sandbar surface where
// thread/claim composition lives (post-only routes are the next
// iteration; until then this is the canonical authoring entry).

export async function ComposeCTA() {
  const t = await getTranslations("compose_cta");

  return (
    <Link
      href="/sandbar"
      className="hover:opacity-90"
      style={{
        marginTop: "28px",
        display: "flex",
        width: "100%",
        background: "var(--vignelli-red)",
        color: "var(--paper)",
        padding: "14px 18px 12px",
        fontFamily: "var(--font-display, 'Archivo Black'), sans-serif",
        fontSize: "18px",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        alignItems: "baseline",
        justifyContent: "space-between",
        textDecoration: "none",
      }}
    >
      <L>{t("label")}</L>
      <span
        aria-hidden
        style={{
          fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
          fontSize: "22px",
          fontWeight: 700,
        }}
      >
        →
      </span>
    </Link>
  );
}
