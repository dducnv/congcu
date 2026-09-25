import UrlEncodeTool from "@/components/dev_tools/url_encode_tool";
import JsonLd from "@/components/seo/JsonLd";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'URL Encode / Decode - Online Tool | MultiTools',
  description: 'Free online URL encoder and decoder. Encode and decode URL components instantly. Perfect for developers working with query strings and APIs.',
  keywords: [
    'url encode', 'url decode', 'url encoder',
    'url decoder', 'percent encoding', 'encodeURIComponent',
    'query string encode', 'url tool online',
  ],
  authors: [{ name: 'MultiTools' }],
  creator: 'MultiTools',
  publisher: 'MultiTools',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tools4u.vercel.app/dev-tools/url-encode',
    title: 'URL Encode / Decode Online',
    description: 'Free online URL encoder and decoder. Encode and decode URL components instantly.',
    siteName: 'MultiTools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'URL Encode / Decode Online',
    description: 'Free online URL encoder and decoder. Encode and decode URL components instantly.',
  },
  alternates: { canonical: 'https://tools4u.vercel.app/dev-tools/url-encode' },
};

const urlSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "MultiTools URL Encoder & Decoder",
  "url": "https://tools4u.vercel.app/dev-tools/url-encode",
  "description": "Encode and decode percent-encoded URLs, query string parameters, and URI components in real-time.",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
  },
};

const page = () => (
  <>
    <JsonLd data={urlSchema} />
    <UrlEncodeTool />
  </>
);

export default page;
