import { TitlePage } from '@/components';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Currency Exchange Rate Calculator - Convert Currencies | MultiTools',
  description: 'Free currency exchange rate calculator. Convert between different currencies with real-time exchange rates. No registration required.',
  keywords: [
    'currency converter',
    'exchange rate',
    'currency calculator',
    'money converter',
    'currency tool',
    'exchange tool',
    'currency utility',
    'money tool',
    'currency helper',
    'exchange helper',
    'currency rate',
    'exchange rate calculator',
    'currency conversion',
    'money conversion',
    'currency calculator online',
    'exchange rate tool',
    'currency tool online',
    'money calculator',
    'currency helper online',
    'exchange utility'
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
    url: 'https://tools4u.vercel.app/currency-exchange',
    title: 'Currency Exchange Rate Calculator - Convert Currencies',
    description: 'Free currency exchange rate calculator. Convert between different currencies with real-time exchange rates. No registration required.',
    siteName: 'MultiTools',
    images: [
      {
        url: '/og-currency-converter.png',
        width: 1200,
        height: 630,
        alt: 'Currency Exchange Rate Calculator - Convert Currencies',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Currency Exchange Rate Calculator - Convert Currencies',
    description: 'Free currency exchange rate calculator. Convert between different currencies with real-time exchange rates. No registration required.',
    images: ['/og-currency-converter.png'],
  },
  alternates: {
    canonical: 'https://tools4u.vercel.app/currency-exchange',
  },
  category: 'technology',
  classification: 'Developer Tools',
  other: {
    'application-name': 'Currency Exchange',
    'apple-mobile-web-app-title': 'Currency Exchange',
    'msapplication-TileColor': '#000000',
    'theme-color': '#000000',
  },
};

const page = () => {
  return (
    <div className=" min-h-screen text-center">
      <TitlePage>
        Đang phát triển
      </TitlePage>
    </div>
  )
}

export default page