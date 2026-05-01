import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Standalone output for the Dockerfile-based deploy (Dokploy → Traefik).
  output: "standalone",
};

export default withNextIntl(nextConfig);
