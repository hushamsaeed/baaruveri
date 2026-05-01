import type { MetadataRoute } from "next";

const SITE = "https://baaruveri.thecrayfish.tech";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /auth/ is auth chrome, not content. /datasets/*.csv routes
        // are downloads — fine to advertise but no value indexing the
        // binary URL itself; the dataset listings on /datasets and
        // /api/v1 are the right entry points for crawlers. /api/ JSON
        // endpoints are crawlable (open data) but blocked here from
        // spamming search results — humans should land on the page,
        // not the JSON.
        disallow: ["/auth/", "/datasets/", "/api/"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
