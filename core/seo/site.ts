export const SITE = {
  url: "https://tools4u.vercel.app",
  name: "MultiTools",
  locale: "en_US",
  /** Default description for pages that do not set their own. */
  description:
    "Free in-browser developer and productivity tools: JSON formatter, SQL & CSV viewer, QR code generator, OCR, regex tester and more. No signup, no uploads.",
  /** Bump when page content changes meaningfully; used as sitemap lastmod. */
  updated: "2026-11-17",
} as const;

export function absoluteUrl(path: string) {
  return path === "/" ? SITE.url : `${SITE.url}${path}`;
}
