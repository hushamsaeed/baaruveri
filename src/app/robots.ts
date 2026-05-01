import type { MetadataRoute } from "next";

const SITE = "https://baaruveri.thecrayfish.tech";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // eFaas stub is auth chrome, not content; the /api budgets is fine to
        // crawl since it's open data, but the /datasets/budgets.csv route is
        // a download — block it from index pollution.
        disallow: ["/auth/", "/datasets/budgets.csv"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
