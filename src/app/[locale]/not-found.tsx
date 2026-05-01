import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { L } from "@/components/i18n-text";

// Locale-aware 404. Saafu-aligned: minimal, civic, offers the three
// primary surfaces as the way back rather than a single home link.
export default async function NotFound() {
  const t = await getTranslations("not_found");
  return (
    <main className="flex-1 flex items-center px-6 sm:px-10 py-20">
      <div className="max-w-2xl mx-auto w-full">
        <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-3">
          <L>{t("eyebrow")}</L>
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          <L>{t("title")}</L>
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed mb-10 max-w-lg">
          <L>{t("body")}</L>
        </p>
        <ul className="grid gap-3 font-mono text-[13px]">
          <li>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-primary hover:underline underline-offset-2"
            >
              <span aria-hidden>→</span>
              <L>{t("go_home")}</L>
            </Link>
          </li>
          <li>
            <Link
              href="/atlas"
              className="inline-flex items-center gap-2 text-primary hover:underline underline-offset-2"
            >
              <span aria-hidden>→</span>
              <L>{t("go_atlas")}</L>
            </Link>
          </li>
          <li>
            <Link
              href="/sandbar"
              className="inline-flex items-center gap-2 text-primary hover:underline underline-offset-2"
            >
              <span aria-hidden>→</span>
              <L>{t("go_sandbar")}</L>
            </Link>
          </li>
          <li>
            <Link
              href="/petitions"
              className="inline-flex items-center gap-2 text-primary hover:underline underline-offset-2"
            >
              <span aria-hidden>→</span>
              <L>{t("go_petitions")}</L>
            </Link>
          </li>
          <li>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 text-primary hover:underline underline-offset-2"
            >
              <span aria-hidden>→</span>
              <L>{t("go_search")}</L>
            </Link>
          </li>
        </ul>
      </div>
    </main>
  );
}
