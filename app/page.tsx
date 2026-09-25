import HomeBody from "@/components/home/home_body";
import JsonLd from "@/components/seo/JsonLd";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "MultiTools - Free Online Developer Tools & Browser Utilities",
  description:
    "All-in-one suite of free, private, client-side developer tools. QR code generator, SQL/CSV viewer, JSON formatter, secret key generator, OCR image to text, regex tester, and more. Zero tracking, 100% in-browser.",
  keywords: [
    "developer tools",
    "online utilities",
    "free developer tools",
    "client-side tools",
    "qr code generator",
    "sql viewer",
    "sqlite viewer",
    "json formatter",
    "secret key generator",
    "image to text ocr",
    "regex tester",
    "base64 encoder",
    "color tools",
    "productivity tools",
    "web utilities",
  ],
  authors: [{ name: "MultiTools" }],
  creator: "MultiTools",
  publisher: "MultiTools",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://tools4u.vercel.app",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tools4u.vercel.app",
    title: "MultiTools - Free Online Developer Tools & Browser Utilities",
    description:
      "Suite of free, privacy-first developer tools running client-side in your browser. No signup required.",
    siteName: "MultiTools",
  },
  twitter: {
    card: "summary_large_image",
    title: "MultiTools - Free Online Developer Tools & Browser Utilities",
    description:
      "Suite of free, privacy-first developer tools running client-side in your browser.",
  },
  category: "technology",
  classification: "Developer Tools",
};

const homeSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://tools4u.vercel.app/#website",
      "name": "MultiTools",
      "url": "https://tools4u.vercel.app",
      "description":
        "Free client-side developer utilities and productivity tools running completely in your browser.",
      "publisher": {
        "@type": "Organization",
        "name": "MultiTools",
        "url": "https://tools4u.vercel.app",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://tools4u.vercel.app/#organization",
      "name": "MultiTools",
      "url": "https://tools4u.vercel.app",
      "logo": "https://tools4u.vercel.app/favicon.ico",
    },
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd data={homeSchema} />
      <HomeBody />
    </>
  );
}