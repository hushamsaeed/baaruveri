import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { TopNav } from "@/components/top-nav";
import { getCurrentStubUser } from "@/lib/auth-stub";
import "../globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Baaruveri — Maldives citizen civic platform",
  description:
    "ބާރުވެރި — per-island civic data, threaded debate by issue and island, eFaas-verified petitions. Concept prototype.",
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
      className={`${inter.variable} ${plexMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider>
          <TopNav user={user} />
          {children}
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
