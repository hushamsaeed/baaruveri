import { getTranslations } from "next-intl/server";
import { L } from "@/components/i18n-text";

// Streaming-friendly loading skeleton for the locale-root segment.
// Server-rendered (no client JS) so it shows up between RSC chunks
// during navigation. Visually quiet — Saafu-restraint.
export default async function Loading() {
  const t = await getTranslations("common");
  return (
    <main className="flex-1 flex items-center px-6 sm:px-10 py-20">
      <div className="max-w-2xl mx-auto w-full">
        <div
          className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          <L>{t("loading")}</L>…
        </div>
      </div>
    </main>
  );
}
