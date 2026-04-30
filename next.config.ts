import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for the Dockerfile-based deploy (Dokploy → Traefik).
  output: "standalone",
};

export default nextConfig;
