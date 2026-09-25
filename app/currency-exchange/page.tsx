import { TitlePage } from '@/components';
import JsonLd from '@/components/seo/JsonLd';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Currency Exchange Rate Calculator - Convert Currencies | MultiTools',
  description: 'Free currency exchange rate calculator. Convert between different global currencies with live market exchange rates. No registration required.',
  keywords: [
    'currency converter',
    'exchange rate',
    'currency calculator',
    'money converter',
    'forex rates',
    'usd to eur',
    'currency conversion online',
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
    url: 'https://tools4u.vercel.app/currency-exchange',
    title: 'Currency Exchange Rate Calculator - Convert Currencies',
    description: 'Free currency exchange rate calculator with real-time conversion rates.',
    siteName: 'MultiTools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Currency Exchange Rate Calculator - Convert Currencies',
    description: 'Free currency exchange rate calculator.',
  },
  alternates: {
    canonical: 'https://tools4u.vercel.app/currency-exchange',
  },
  category: 'finance',
  classification: 'Financial Tools',
};

const currencySchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "MultiTools Currency Exchange Rate Calculator",
  "url": "https://tools4u.vercel.app/currency-exchange",
  "description": "Convert foreign currencies with live market exchange rate calculations.",
  "applicationCategory": "FinanceApplication",
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
      <JsonLd data={currencySchema} />
      <div className="min-h-screen text-center">
        <TitlePage>
          Đang phát triển
        </TitlePage>
      </div>
    </>
  );
};

export default page;