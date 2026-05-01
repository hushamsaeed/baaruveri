import { Link } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });
  const tn = await getTranslations({ locale, namespace: "nav" });

  return (
    <main className="flex flex-1 flex-col">
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-mono mb-4">
          <span className="dv-text">ބާރުވެރި</span>
          <span> · Baaruveri</span>
        </p>
        <h1 className="max-w-3xl text-3xl sm:text-4xl font-semibold tracking-tight mb-5">
          {locale === "dv" ? <span className="dv-text">{t("tagline")}</span> : t("tagline")}
        </h1>
        <p className="max-w-xl text-base text-muted-foreground leading-relaxed mb-10">
          {locale === "dv" ? <span className="dv-text">{t("lede")}</span> : t("lede")}
        </p>
        <div className="flex gap-3 mb-16">
          <Link
            href="/atlas"
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {locale === "dv" ? <span className="dv-text">{tn("open_atlas")}</span> : tn("open_atlas")}
          </Link>
          <Link
            href="/sandbar"
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium border border-border text-foreground hover:bg-secondary transition-colors"
          >
            {locale === "dv" ? <span className="dv-text">{tn("go_to_sandbar")}</span> : tn("go_to_sandbar")}
          </Link>
        </div>
      </section>
    </main>
  );
}
