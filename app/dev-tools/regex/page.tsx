import RegexTester from "@/components/dev_tools/regex_tester";
import JsonLd from "@/components/seo/JsonLd";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Regex Tester - Test Regular Expressions Online | MultiTools',
  description: 'Free online regex tester. Test regular expressions with real-time highlighting, match details, capture groups. Includes common regex presets for email, URL, phone, IP, hex color.',
  keywords: [
    'regex tester', 'regex online', 'regular expression tester',
    'regex matcher', 'regex debugger', 'regex tool',
    'test regex', 'regex pattern', 'regex validator',
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
    url: 'https://tools4u.vercel.app/dev-tools/regex',
    title: 'Regex Tester - Test Regular Expressions Online',
    description: 'Free online regex tester with real-time highlighting, match details, and capture groups.',
    siteName: 'MultiTools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Regex Tester - Test Regular Expressions Online',
    description: 'Free online regex tester with real-time highlighting, match details, and capture groups.',
  },
  alternates: { canonical: 'https://tools4u.vercel.app/dev-tools/regex' },
};

const regexSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "MultiTools Regular Expression Tester",
  "url": "https://tools4u.vercel.app/dev-tools/regex",
  "description": "Interactive regular expression tester with real-time syntax matching, group extraction, and common pattern presets.",
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
    <JsonLd data={regexSchema} />
    <RegexTester />
  </>
);

export default page;
