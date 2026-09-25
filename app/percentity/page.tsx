import { PercentBlocks } from "@/components/percentity/percentity";
import JsonLd from "@/components/seo/JsonLd";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Percentage Calculator - Calculate Percentages Online | MultiTools',
  description: 'Free percentage calculator tool. Calculate percentages, percentage increase, decrease, discount, and percentage of a number with formulas.',
  keywords: [
    'percentage calculator',
    'percent calculator',
    'calculate percentage',
    'percentage formula',
    'percent increase',
    'percent decrease',
    'percentage of number',
    'discount calculator',
  ],
  authors: [{ name: 'MultiTools' }],
  creator: 'MultiTools',
  publisher: 'MultiTools',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tools4u.vercel.app/percentity',
    title: 'Percentage Calculator - Calculate Percentages Online',
    description: 'Free percentage calculator tool. Calculate percentages, increase, and decrease.',
    siteName: 'MultiTools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Percentage Calculator - Calculate Percentages Online',
    description: 'Free percentage calculator tool.',
  },
  alternates: {
    canonical: 'https://tools4u.vercel.app/percentity',
  },
  category: 'utilities',
  classification: 'Math Tools',
};

const percentSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "MultiTools Percentage Calculator",
  "url": "https://tools4u.vercel.app/percentity",
  "description": "Calculate percentages, percentage change, markup, discount, and ratios instantly.",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
  },
};

const page = () => {
  return (
    <>
      <JsonLd data={percentSchema} />
      <div className="min-h-screen py-8 px-2">
        <PercentBlocks />
      </div>
    </>
  );
};

export default page;