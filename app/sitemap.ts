import { SEO_PAGES } from "@/core/seo/pages";
import { SITE, absoluteUrl } from "@/core/seo/site";
import type { MetadataRoute } from "next";

// Generated from the SEO registry: every indexable page, nothing else.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(SITE.updated);
  return SEO_PAGES.filter((p) => !p.noindex).map((p) => ({
    url: absoluteUrl(p.path),
    lastModified,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}
