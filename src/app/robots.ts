import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Auth pages render a shell with nothing in it for a crawler, and the
        // API routes answer 401. Neither belongs in an index.
        disallow: ["/api/", "/sign-in", "/sign-up", "/forgot-password", "/reset-password"],
      },
    ],
    // This was commented out, which is why robots.txt named no sitemap.
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
