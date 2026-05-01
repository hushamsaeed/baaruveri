import type { MetadataRoute } from "next";
import { islands } from "@/data/islands";
import { threads } from "@/data/threads";
import { petitions } from "@/data/petitions";

const SITE = "https://baaruveri.thecrayfish.tech";
const LOCALES = ["dv", "en"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // Top-level surfaces
  const topRoutes = ["", "/atlas", "/sandbar", "/petitions", "/datasets", "/about/moderation", "/about/takedowns"];
  for (const locale of LOCALES) {
    for (const route of topRoutes) {
      entries.push({
        url: `${SITE}/${locale}${route}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: route === "" ? 1.0 : 0.8,
      });
    }
  }

  // Per-island profiles
  for (const locale of LOCALES) {
    for (const island of islands) {
      entries.push({
        url: `${SITE}/${locale}/atlas/${island.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  // Threads
  for (const locale of LOCALES) {
    for (const thread of threads) {
      entries.push({
        url: `${SITE}/${locale}/sandbar/${thread.id}`,
        lastModified: new Date(thread.started_at),
        changeFrequency: "daily",
        priority: 0.6,
      });
    }
  }

  // Petitions
  for (const locale of LOCALES) {
    for (const p of petitions) {
      entries.push({
        url: `${SITE}/${locale}/petitions/${p.id}`,
        lastModified: new Date(p.started_at),
        changeFrequency: "daily",
        priority: 0.6,
      });
    }
  }

  return entries;
}
