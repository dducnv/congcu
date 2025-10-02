import { PercentBlocks } from "@/components/percentity/percentity";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: 'Percentage Calculator - Calculate Percentages Online | MultiTools',
  description: 'Free percentage calculator tool. Calculate percentages, percentage increase, decrease, and percentage of a number. Includes formulas and examples.',
  keywords: [
    'percentage calculator',
    'percent calculator',
    'calculate percentage',
    'percentage formula',
    'percent increase',
    'percent decrease',
    'percentage of number',
    'math calculator',
    'percentage tool',
    'percent tool',
    'math tool',
    'calculator online',
    'percentage math',
    'percent math',
    'percentage examples',
    'percent examples',
    'math utility',
    'calculation tool',
    'percentage helper',
    'percent helper'
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
    description: 'Free percentage calculator tool. Calculate percentages, percentage increase, decrease, and percentage of a number. Includes formulas and examples.',
    siteName: 'MultiTools',
    images: [
      {
        url: '/og-percentage-calculator.png',
        width: 1200,
        height: 630,
        alt: 'Percentage Calculator - Calculate Percentages Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Percentage Calculator - Calculate Percentages Online',
    description: 'Free percentage calculator tool. Calculate percentages, percentage increase, decrease, and percentage of a number. Includes formulas and examples.',
    images: ['/og-percentage-calculator.png'],
  },
  alternates: {
    canonical: 'https://tools4u.vercel.app/percentity',
  },
  category: 'technology',
  classification: 'Developer Tools',
  other: {
    'application-name': 'Percentage Calculator',
    'apple-mobile-web-app-title': 'Percentage Calculator',
    'msapplication-TileColor': '#000000',
    'theme-color': '#000000',
  },
};

const page = () => {
  return (
    <div className="min-h-screen py-8 px-2">
      <PercentBlocks />
    </div>
  )
}

export default page