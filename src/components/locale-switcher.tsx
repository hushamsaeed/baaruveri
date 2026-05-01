"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTransition } from "react";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations("locale_switcher");
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  function switchTo(next: string) {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next as "dv" | "en" });
    });
  }

  return (
    <div className="inline-flex items-center gap-0 border border-border bg-card text-[12px] font-mono">
      <span className="px-2 py-1 text-muted-foreground border-e border-border">
        {t("label")}
      </span>
      {routing.locales.map((loc, i) => (
        <button
          key={loc}
          type="button"
          onClick={() => switchTo(loc)}
          disabled={pending}
          className={`px-2.5 py-1 transition-colors ${
            i > 0 ? "border-s border-border" : ""
          } ${
            loc === locale
              ? "bg-foreground text-background"
              : "hover:bg-secondary"
          }`}
        >
          {loc === "dv" ? (
            <span className="dv-text">{t("dv")}</span>
          ) : (
            <span>{t("en")}</span>
          )}
        </button>
      ))}
    </div>
  );
}
