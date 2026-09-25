import Base64Tool from "@/components/dev_tools/base64_tool";
import JsonLd from "@/components/seo/JsonLd";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Base64 Encode / Decode - Online Tool | MultiTools',
  description: 'Free online Base64 encoder and decoder. Convert text to Base64 and Base64 to text instantly. Supports UTF-8. No registration required.',
  keywords: [
    'base64 encode', 'base64 decode', 'base64 converter',
    'base64 online', 'text to base64', 'base64 to text',
    'base64 tool', 'encode decode online',
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
    url: 'https://tools4u.vercel.app/dev-tools/base64',
    title: 'Base64 Encode / Decode Online',
    description: 'Free online Base64 encoder and decoder. Convert text to Base64 and back instantly.',
    siteName: 'MultiTools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Base64 Encode / Decode Online',
    description: 'Free online Base64 encoder and decoder. Convert text to Base64 and back instantly.',
  },
  alternates: { canonical: 'https://tools4u.vercel.app/dev-tools/base64' },
};

const base64Schema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "MultiTools Base64 Encoder & Decoder",
  "url": "https://tools4u.vercel.app/dev-tools/base64",
  "description": "Convert plain text to Base64 and Base64 to UTF-8 text instantly without server transmission.",
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
    <JsonLd data={base64Schema} />
    <Base64Tool />
  </>
);

export default page;
