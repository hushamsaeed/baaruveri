import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["dv", "en"],
  defaultLocale: "dv",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
