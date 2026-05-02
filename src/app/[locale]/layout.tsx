import type { Metadata } from "next";
import {
  Archivo,
  Archivo_Black,
  Inter,
  JetBrains_Mono,
} from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { TopNav } from "@/components/top-nav";
import { LaneRail } from "@/components/lane-rail";
import { getCurrentStubUser } from "@/lib/auth-stub";
import "../globals.css";

// Vignelli civic-press type system (locked 2026-05-02; spec §3).
// Three Latin faces: Archivo Black (display, hero numerals, masthead),
// Archivo 500/700 (labels, all-caps captions), Inter 400/500 (reading
// body), JetBrains Mono (IDs, deltas, dates, source-link tags).
// Dhivehi MV Faseyha 400/700 stays loaded from RaajjeFonts CDN via
// the @font-face declarations in globals.css.
const archivoBlack = Archivo_Black({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400", // Archivo Black ships only as 400 — already heavy
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-sans-bold",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
});

const SITE_URL = "https://baaruveri.thecrayfish.tech";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Baaruveri — Maldives citizen civic platform",
    template: "%s — Baaruveri",
  },
  description:
    "ބާރުވެރި — per-island civic data, threaded debate by issue and island, eFaas-verified petitions. Concept prototype.",
  applicationName: "Baaruveri",
  authors: [{ name: "hushamsaeed", url: "https://github.com/hushamsaeed" }],
  openGraph: {
    type: "website",
    title: "Baaruveri — Maldives citizen civic platform",
    description:
      "Per-island civic data, threaded debate by issue and island, eFaas-verified petitions. Concept prototype.",
    siteName: "Baaruveri",
    url: SITE_URL,
    locale: "en_US",
    alternateLocale: ["dv_MV"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Baaruveri — Maldives citizen civic platform",
    description:
      "Per-island civic data, threaded debate by issue and island, eFaas-verified petitions.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const dir = locale === "dv" ? "rtl" : "ltr";
  const t = await getTranslations({ locale, namespace: "common" });
  const user = await getCurrentStubUser();

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${archivoBlack.variable} ${archivo.variable} ${inter.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider>
          <a href="#main-content" className="skip-link">
            {t("skip_to_content")}
          </a>
          <TopNav user={user} />
          <LaneRail />
          <div id="main-content">{children}</div>
          <footer className="mt-auto border-t border-border">
            <div className="max-w-6xl mx-auto px-6 sm:px-10 py-5 text-[11px] text-muted-foreground text-center">
              {t("footer_disclaimer")}
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
