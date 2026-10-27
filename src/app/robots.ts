import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Only /api/. The auth pages (/sign-in, /sign-up, /forgot-password,
        // /reset-password) were listed here too, and that is what kept Google
        // reporting them: a Disallow stops Googlebot from fetching a URL at
        // all, so it never reads the page's own `noindex` and never sees a
        // 404. Google files the URL under "Blocked by robots.txt" instead of
        // dropping it, and a robots-blocked URL can still be indexed URL-only
        // from an external link. Those routes no longer exist in this app
        // (removed in #30), so letting Googlebot crawl them gets a 404 and
        // Google drops them. If auth pages ever come back, they must carry
        // their own `noIndex` via constructMetadata(). Do not re-add a
        // Disallow here, it would mask the tag again.
        disallow: ["/api/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
