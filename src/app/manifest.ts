import type { MetadataRoute } from "next";

// PWA manifest. Lets the site be installed to a homescreen / pinned in
// Chrome's app launcher, and gives mobile browsers correct theming for
// the URL bar. Bilingual `description` skews English because PWA store
// listings rarely surface non-Latin text reliably; the localised
// experience kicks in once the user lands on /dv or /en.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Baaruveri — Maldives citizen civic platform",
    short_name: "Baaruveri",
    description:
      "Per-island civic data. Threaded debate by issue × island. Threshold petitions to councils and parliament.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf8f3",
    theme_color: "#3d6470",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
    categories: ["government", "news", "social"],
  };
}
