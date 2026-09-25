import TimestampTool from "@/components/dev_tools/timestamp_tool";
import JsonLd from "@/components/seo/JsonLd";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Timestamp Converter - Unix Epoch to Date | MultiTools',
  description: 'Free online Unix timestamp converter. Convert between Unix epoch timestamps and human-readable dates. Live clock, quick references, supports seconds and milliseconds.',
  keywords: [
    'unix timestamp', 'timestamp converter', 'epoch converter',
    'unix time', 'epoch to date', 'date to timestamp',
    'unix timestamp online', 'timestamp tool',
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
    url: 'https://tools4u.vercel.app/dev-tools/timestamp',
    title: 'Timestamp Converter - Unix Epoch to Date',
    description: 'Free online Unix timestamp converter. Convert between timestamps and dates instantly.',
    siteName: 'MultiTools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Timestamp Converter - Unix Epoch to Date',
    description: 'Free online Unix timestamp converter. Convert between timestamps and dates instantly.',
  },
  alternates: { canonical: 'https://tools4u.vercel.app/dev-tools/timestamp' },
};

const timestampSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "MultiTools Unix Timestamp & Epoch Converter",
  "url": "https://tools4u.vercel.app/dev-tools/timestamp",
  "description": "Convert between Unix epoch timestamps (seconds/milliseconds) and human-readable UTC/local date strings.",
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
    <JsonLd data={timestampSchema} />
    <TimestampTool />
  </>
);

export default page;
