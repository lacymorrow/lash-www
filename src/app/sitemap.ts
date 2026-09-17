import type { MetadataRoute } from "next";
import { getAllDocSlugsFromFileSystem } from "@/lib/docs";
import { siteConfig } from "@/config/site-config";
import { routes } from "@/config/routes";

/**
 * The site is three things: the landing page, the docs, and the changelog.
 *
 * This used to export generateSitemaps(), which splits output across
 * /sitemap/0.xml, /sitemap/1.xml and so on. That is for sites with tens of
 * thousands of URLs, and it is why /sitemap.xml returned 404 here. A single
 * file is correct at this size.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${siteConfig.url}${routes.docs}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/changelog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  const docRoutes: MetadataRoute.Sitemap = (await getAllDocSlugsFromFileSystem())
    // The docs index is already listed above as /docs.
    .filter((path) => path !== "index" && path.length > 0)
    .map((path) => ({
      url: `${siteConfig.url}${routes.docs}/${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

  return [...staticRoutes, ...docRoutes];
}
