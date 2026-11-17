import type { Metadata } from "next";
import { getPage, type SeoPage } from "./pages";
import { SITE, absoluteUrl } from "./site";

export function ogImageUrl(page: SeoPage) {
  return `/og/${page.slug}`;
}

/** Full Next.js metadata for a page in the SEO registry. */
export function buildMetadata(pathOrPage: string | SeoPage): Metadata {
  const page = typeof pathOrPage === "string" ? getPage(pathOrPage) : pathOrPage;
  const url = absoluteUrl(page.path);
  // Titles that already contain the brand (home, about) are used as is.
  const isHome = page.path === "/" || page.title.includes(SITE.name);
  const fullTitle = isHome ? page.title : `${page.title} | ${SITE.name}`;
  const image = { url: ogImageUrl(page), width: 1200, height: 630, alt: `${page.name}: ${page.tagline}` };

  return {
    // The root layout's template appends " | MultiTools"; the home page uses its title as is.
    title: isHome ? { absolute: page.title } : page.title,
    description: page.description,
    keywords: page.keywords.length ? page.keywords : undefined,
    alternates: { canonical: url },
    robots: page.noindex
      ? { index: false, follow: true }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
    openGraph: {
      type: "website",
      locale: SITE.locale,
      siteName: SITE.name,
      url,
      title: fullTitle,
      description: page.description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: page.description,
      images: [image.url],
    },
  };
}

// ---------- JSON-LD ----------

export function breadcrumbSchema(page: SeoPage) {
  const items: Array<{ name: string; url: string }> = [{ name: "Home", url: SITE.url }];
  if (page.path !== "/") items.push({ name: page.name, url: absoluteUrl(page.path) });
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url })),
  };
}

export function appSchema(page: SeoPage) {
  return {
    "@type": "WebApplication",
    "@id": `${absoluteUrl(page.path)}#app`,
    name: page.name,
    url: absoluteUrl(page.path),
    description: page.description,
    applicationCategory: page.category ?? "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    ...(page.features?.length ? { featureList: page.features } : {}),
    publisher: { "@id": `${SITE.url}/#organization` },
  };
}

export function faqSchema(page: SeoPage) {
  if (!page.faqs?.length) return null;
  return {
    "@type": "FAQPage",
    "@id": `${absoluteUrl(page.path)}#faq`,
    mainEntity: page.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": `${SITE.url}/#organization`,
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/icon-512.png`,
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: "en",
    publisher: { "@id": `${SITE.url}/#organization` },
  };
}

/** Structured data for a tool page: the app, breadcrumbs and (when present) FAQ. */
export function toolGraph(page: SeoPage) {
  const graph: object[] = [appSchema(page), breadcrumbSchema(page)];
  const faq = faqSchema(page);
  if (faq) graph.push(faq);
  return { "@context": "https://schema.org", "@graph": graph };
}
