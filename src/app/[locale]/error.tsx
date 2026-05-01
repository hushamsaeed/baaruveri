"use client";

import { useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { L } from "@/components/i18n-text";

// Locale-aware error boundary. Logs the error server-side via the
// digest hash that Next.js attaches in production, surfaces a calm
// recovery path instead of a stack trace.
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error_page");

  useEffect(() => {
    // Production builds redact the message; the digest is the only
    // safe handle to surface (matches what server logs key on).
    if (process.env.NODE_ENV === "development") {
      console.error("[error-boundary]", error);
    }
  }, [error]);

  return (
    <main className="flex-1 flex items-center px-6 sm:px-10 py-20">
      <div className="max-w-2xl mx-auto w-full">
        <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-3">
          <L>{t("eyebrow")}</L>
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          <L>{t("title")}</L>
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed mb-6 max-w-lg">
          <L>{t("body")}</L>
        </p>
        {error.digest && (
          <p className="text-[11px] text-muted-foreground font-mono mb-8">
            <L>{t("digest_label")}</L>{" "}
            <span className="text-foreground">{error.digest}</span>
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4 font-mono text-[13px]">
          <button
            type="button"
            onClick={reset}
            className="bg-primary text-primary-foreground px-4 py-2 hover:bg-primary/90 transition-colors uppercase tracking-[0.1em] text-[12px]"
          >
            <L>{t("retry")}</L>
          </button>
          <Link
            href="/"
            className="text-primary hover:underline underline-offset-2"
          >
            <L>{t("go_home")}</L>
          </Link>
        </div>
      </div>
    </main>
  );
}
