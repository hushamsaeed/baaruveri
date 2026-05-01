import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip: /api, /datasets (file-extension exclusion catches the .csv routes),
  // /auth (except /auth/efaas which is locale-aware), Next internals, the
  // OG/twitter image route handlers (no file extension, would otherwise get
  // locale-redirected and never reach the ImageResponse), and anything with
  // an extension.
  matcher: [
    "/((?!api|datasets|opengraph-image|twitter-image|auth/(?!efaas)|_next|_vercel|.*\\..*).*)",
  ],
};
