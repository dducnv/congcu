import ColorConverterPage from '@/components/color_converter/color_converter';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Color Converter - Convert HEX, RGB, HSL Colors | MultiTools',
  description: 'Free color converter tool. Convert between HEX, RGB, HSL, and other color formats. Perfect for designers and developers.',
  keywords: [
    'color converter',
    'hex to rgb',
    'rgb to hex',
    'hsl converter',
    'color format',
    'color tool',
    'color utility',
    'hex color',
    'RGB color',
    'HSL color',
    'color picker',
    'color tool online',
    'color helper',
    'color utility online',
    'color format converter',
    'color code converter',
    'color value converter',
    'color system converter',
    'color space converter',
    'color model converter'
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
    url: 'https://congcu4u.vercel.app/dev-tools/color-converter',
    title: 'Color Converter - Convert HEX, RGB, HSL Colors',
    description: 'Free color converter tool. Convert between HEX, RGB, HSL, and other color formats. Perfect for designers and developers.',
    siteName: 'MultiTools',
    images: [
      {
        url: '/og-color-converter.png',
        width: 1200,
        height: 630,
        alt: 'Color Converter - Convert HEX, RGB, HSL Colors',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Color Converter - Convert HEX, RGB, HSL Colors',
    description: 'Free color converter tool. Convert between HEX, RGB, HSL, and other color formats. Perfect for designers and developers.',
    images: ['/og-color-converter.png'],
  },
  alternates: {
    canonical: 'https://congcu4u.vercel.app/dev-tools/color-converter',
  },
  category: 'technology',
  classification: 'Developer Tools',
  other: {
    'application-name': 'Color Converter',
    'apple-mobile-web-app-title': 'Color Converter',
    'msapplication-TileColor': '#000000',
    'theme-color': '#000000',
  },
};

const page = () => {
  return (
    <ColorConverterPage />
  )
}

export default page