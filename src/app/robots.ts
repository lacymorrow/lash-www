import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Only /api/. The auth pages (/sign-in, /sign-up, /forgot-password,
        // /reset-password) already serve `noindex, follow`, and a Disallow here
        // stopped Googlebot from ever fetching them, so it never read the tag.
        // Google filed them under "Blocked by robots.txt" instead of dropping
        // them, and a robots-blocked URL can still be indexed URL-only from an
        // external link. Crawling them is the thing that makes noindex work.
        disallow: ["/api/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
