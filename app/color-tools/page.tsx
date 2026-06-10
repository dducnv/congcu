import ColorTools from "@/components/color_tools/color_tools";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Color Tools - Picker, Converter & Palette Generator | MultiTools',
  description: 'All-in-one color tool: pick colors from images, convert between HEX/RGB/HSL/CMYK, get CSS & Flutter code, check contrast (WCAG), generate palettes. Free, no registration.',
  keywords: [
    'color picker',
    'color converter',
    'hex to rgb',
    'rgb to hex',
    'hsl converter',
    'color from image',
    'color palette generator',
    'contrast checker',
    'wcag contrast',
    'flutter color',
    'css color',
    'cmyk converter',
    'color tool online',
    'extract color from image',
    'color picker from image',
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
    url: 'https://tools4u.vercel.app/color-tools',
    title: 'Color Tools - Picker, Converter & Palette Generator',
    description: 'All-in-one color tool: pick colors from images, convert HEX/RGB/HSL/CMYK, get CSS & Flutter code, check contrast, generate palettes.',
    siteName: 'MultiTools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Color Tools - Picker, Converter & Palette Generator',
    description: 'All-in-one color tool: pick colors from images, convert HEX/RGB/HSL/CMYK, get CSS & Flutter code, check contrast, generate palettes.',
  },
  alternates: {
    canonical: 'https://tools4u.vercel.app/color-tools',
  },
  category: 'technology',
  classification: 'Developer Tools',
  other: {
    'application-name': 'Color Tools',
    'apple-mobile-web-app-title': 'Color Tools',
    'msapplication-TileColor': '#000000',
    'theme-color': '#000000',
  },
};

const page = () => {
  return <ColorTools />;
};

export default page;
