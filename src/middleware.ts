import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip /api, the CSV export, Next internals, and any file with an extension.
  matcher: [
    "/((?!api|datasets/budgets\\.csv|auth/(?!efaas)|_next|_vercel|.*\\..*).*)",
  ],
};
