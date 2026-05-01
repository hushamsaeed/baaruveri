import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Standalone output for the Dockerfile-based deploy (Dokploy → Traefik).
  output: "standalone",
  experimental: {
    // Default is 10MB. The proxy buffers every request body (next-intl
    // middleware runs on every locale-prefixed page route, including
    // Server Action POSTs). Our largest legitimate payload is a 2k-char
    // claim/comment body — 64kb is generous headroom and bounds memory
    // pressure under burst spam.
    proxyClientMaxBodySize: "64kb",
    serverActions: {
      // Same reasoning. Default is 1MB.
      bodySizeLimit: "64kb",
    },
  },
};

export default withNextIntl(nextConfig);
